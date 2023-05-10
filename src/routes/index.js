import fligthRouter from "./flightRoutes.js";

const routes = [["fligths", fligthRouter]];

export const router = (app) => {
  routes.forEach(([path, controller]) => {
    app.use(`/${path}`, controller);
  });
};
