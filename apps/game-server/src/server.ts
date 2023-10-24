import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import fastifyExpress from "@fastify/express";
import Fastify, { FastifyServerFactory } from "fastify";
import { createServer, Server as HttpServer } from "http";
import { ChessRoom } from "./rooms/chess/chess.room";
import { PrismaClient } from "ks-database";

export const prismaClient = new PrismaClient();

let server: HttpServer;
const serverFactory: FastifyServerFactory = (handler) => {
  server = createServer((req, res) => {
    handler(req, res);
  });

  return server;
};

const bootstrap = async () => {
  const fastify = Fastify({ serverFactory });
  await fastify.register(fastifyExpress);

  fastify.ready(() => {
    const gameServer = new Server({
      transport: new WebSocketTransport({
        server,
      }),
    });

    gameServer.define("chess", ChessRoom);

    gameServer.listen(8080);
  });
};

bootstrap();
