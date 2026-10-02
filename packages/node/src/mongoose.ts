import { emitTraceEvent } from "./context";
import { sanitizeTraceData } from "@traceora/core";

/**
 * Creates a Mongoose Plugin that automatically tracks database queries
 * and attaches them to the current Traceora trace if one exists.
 * 
 * Usage:
 * mongoose.plugin(traceoraMongoosePlugin);
 */
export function traceoraMongoosePlugin(schema: any, options: { captureQueryArgs?: boolean } = {}) {
  const operations = [
    'find', 'findOne', 'findOneAndUpdate', 'findOneAndRemove', 'findOneAndDelete',
    'insertOne', 'insertMany', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany',
    'aggregate', 'count', 'countDocuments', 'estimatedDocumentCount'
  ];

  for (const operation of operations) {
    // Pre hook to start timer
    schema.pre(operation, function (this: any, next: () => void) {
      this._traceoraStartTime = Date.now();
      next();
    });

    // Post hook to emit event
    schema.post(operation, function (this: any, res: any, next: () => void) {
      if (this._traceoraStartTime) {
        const duration = Date.now() - this._traceoraStartTime;
        
        let args = "";
        if (options.captureQueryArgs) {
          try {
            args = JSON.stringify(sanitizeTraceData(this.getQuery ? this.getQuery() : {}));
          } catch {
            args = "[Unserializable]";
          }
        }

        emitTraceEvent({
          type: "DATABASE_QUERY",
          source: `Mongoose: ${this.model?.modelName || 'UnknownModel'}.${operation}`,
          duration,
          metadata: {
            model: this.model?.modelName || 'UnknownModel',
            operation,
            ...(options.captureQueryArgs ? { args } : {}),
          }
        });
      }
      next();
    });
  }
}
