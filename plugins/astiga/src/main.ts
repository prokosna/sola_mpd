import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: "0.0.0.0:3001",
        package: "sola",
        protoPath: "./src/proto/plugin/plugin_service.proto",
        loader: {
          includeDirs: ["./src/proto"],
        },
      },
    }
  );
  await app.listen();
}
bootstrap();
