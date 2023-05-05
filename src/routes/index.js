import fligthRouter from "./flightRoutes.js";

const routes = [["fligth", fligthRouter]];

export const router = (app) => {
  routes.forEach(([path, controller]) => {
    app.use(`/api/v1/${path}`, controller);
  });
};
