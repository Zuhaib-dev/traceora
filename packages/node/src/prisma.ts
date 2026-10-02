import { emitTraceEvent } from "./context";
import { sanitizeTraceData } from "@traceora/core";

/**
 * Creates a Prisma Client Extension that automatically tracks database queries
 * and attaches them to the current Traceora trace if one exists.
 * 
 * Usage:
 * const prisma = new PrismaClient().$extends(traceoraPrismaExtension())
 */
export function traceoraPrismaExtension(options: { captureQueryArgs?: boolean } = {}) {
  return {
    name: 'Traceora',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          const startTime = Date.now();
          
          try {
            const result = await query(args);
            const duration = Date.now() - startTime;
            
            let stringifiedArgs = "";
            if (options.captureQueryArgs) {
              try {
                stringifiedArgs = JSON.stringify(sanitizeTraceData(args));
              } catch {
                stringifiedArgs = "[Unserializable]";
              }
            }
            
            emitTraceEvent({
              type: "DATABASE_QUERY",
              source: `Prisma: ${model}.${operation}`,
              duration,
              metadata: {
                model,
                operation,
                ...(options.captureQueryArgs ? { args: stringifiedArgs } : {})
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
