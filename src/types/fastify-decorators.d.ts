declare module 'fastify-decorators' {
  export function Controller(options?: { route: string; tags: string[] }): ClassDecorator;
  export function GET(
    route: string,
    options?: { schema?: any; preHandler?: any[] },
  ): MethodDecorator;
  export function POST(
    route: string,
    options?: { schema?: any; preHandler?: any[] },
  ): MethodDecorator;
  export function PUT(
    route: string,
    options?: { schema?: any; preHandler?: any[] },
  ): MethodDecorator;
  export function DELETE(
    route: string,
    options?: { schema?: any; preHandler?: any[] },
  ): MethodDecorator;
  export function bootstrap(fastify: any, options: { controllers: any[] }): Promise<void>;
}
