import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Namespace } from "socket.io";
import logger from "../common/utils/logger";

class SocketManager {
  private static instance: SocketManager;
  public io: SocketIOServer | null = null;
  private namespaces: Map<string, Namespace> = new Map();

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });
    console.log("Socket is Running 🔹");
    return this.io;
  }

  public getNamespace(name: string): Namespace {
    if (!this.io) {
      throw new Error("socket io is not initialized. Call init() first.");
    }

    if (!this.namespaces.has(name)) {
      const nsp = this.io.of(name);
      nsp.on("connection", (socket) => {
        logger.info(
          "Client connected to namespace: " +
            name +
            " with socket id: " +
            socket.id,
        );

        socket.on("disconnect", () => {
          logger.info(
            `Client disconnected from namespace: ${name} with socket id: ${socket.id}`,
          );
        });
      });
      this.namespaces.set(name, nsp);
    }

    return this.namespaces.get(name)!;
  }
}

export const socketManager = SocketManager.getInstance();
