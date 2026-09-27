import { emitTraceEvent } from "./context";

/**
 * Creates a Mongoose Plugin that automatically tracks database queries
 * and attaches them to the current Traceora trace if one exists.
 * 
 * Usage:
 * mongoose.plugin(traceoraMongoosePlugin);
 */
export function traceoraMongoosePlugin(schema: any) {
  const operations = [
    'find', 'findOne', 'findOneAndUpdate', 'findOneAndRemove', 'findOneAndDelete',
    'insertOne', 'insertMany', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany',
    'aggregate', 'count', 'countDocuments', 'estimatedDocumentCount'
  ];

  for (const operation of operations) {
    // Pre hook to start timer
    schema.pre(operation, function (this: any, next: Function) {
      this._traceoraStartTime = Date.now();
      next();
    });

    // Post hook to emit event
    schema.post(operation, function (this: any, res: any, next: Function) {
      if (this._traceoraStartTime) {
        const duration = Date.now() - this._traceoraStartTime;
        
        let args = "";
        try {
          args = JSON.stringify(this.getQuery ? this.getQuery() : {});
        } catch (e) {
          args = "[Unserializable]";
        }

        emitTraceEvent({
          // @ts-ignore - Event type is generic enough
          type: "DATABASE_QUERY",
          source: `Mongoose: ${this.model?.modelName || 'UnknownModel'}.${operation}`,
          duration,
          metadata: {
            model: this.model?.modelName || 'UnknownModel',
            operation,
            args,
          }
        });
      }
      next();
    });
  }
}
