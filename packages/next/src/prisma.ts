import { emitTraceEvent } from "./context";

/**
 * Creates a Prisma Client Extension that automatically tracks database queries
 * and attaches them to the current Traceora trace if one exists.
 * 
 * Usage:
 * const prisma = new PrismaClient().$extends(traceoraPrismaExtension())
 */
export function traceoraPrismaExtension() {
  return {
    name: 'Traceora',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          const startTime = Date.now();
          
          try {
            const result = await query(args);
            const duration = Date.now() - startTime;
            
            // Only capture arguments if it's not going to be massively huge.
            // In a real production environment we might sanitize this!
            let stringifiedArgs = "";
            try {
              stringifiedArgs = JSON.stringify(args);
            } catch (e) {
              stringifiedArgs = "[Unserializable]";
            }
            
            emitTraceEvent({
              // @ts-ignore - Event type is generic enough
              type: "DATABASE_QUERY",
              source: `Prisma: ${model}.${operation}`,
              duration,
              metadata: {
                model,
                operation,
                args: stringifiedArgs
              }
            });
            
            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            
            emitTraceEvent({
              type: "ERROR",
              source: `Prisma: ${model}.${operation}`,
              duration,
              metadata: {
                model,
                operation,
                error: error instanceof Error ? error.message : String(error)
              }
            });
            
            throw error;
          }
        },
      },
    },
  };
}
