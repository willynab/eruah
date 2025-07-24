import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";
import { newsListProcedure } from "./routes/news/list/route";
import { newsCreateProcedure } from "./routes/news/create/route";
import { prayersListProcedure } from "./routes/prayers/list/route";
import { prayersCreateProcedure } from "./routes/prayers/create/route";
import { audioListProcedure } from "./routes/audio/list/route";
import { audioCreateProcedure } from "./routes/audio/create/route";
import { categoriesListProcedure } from "./routes/categories/list/route";
import { categoriesCreateProcedure } from "./routes/categories/create/route";
import { popupForgeListProcedure } from "./routes/popup-forge/list/route";
import { popupForgeCreateProcedure } from "./routes/popup-forge/create/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  auth: createTRPCRouter({
    login: loginProcedure,
    register: registerProcedure,
  }),
  news: createTRPCRouter({
    list: newsListProcedure,
    create: newsCreateProcedure,
  }),
  prayers: createTRPCRouter({
    list: prayersListProcedure,
    create: prayersCreateProcedure,
  }),
  audio: createTRPCRouter({
    list: audioListProcedure,
    create: audioCreateProcedure,
  }),
  categories: createTRPCRouter({
    list: categoriesListProcedure,
    create: categoriesCreateProcedure,
  }),
  popupForge: createTRPCRouter({
    list: popupForgeListProcedure,
    create: popupForgeCreateProcedure,
  }),
});

export type AppRouter = typeof appRouter;