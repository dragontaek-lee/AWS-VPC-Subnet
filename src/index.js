import express from "express";
import cors from "cors";
import router from "./router/index.js";

const app = express(); 
const PORT = 3000;

app.use((req, res, next) => {
    req.now = Date.now();
    next();
});

app.use(cors({ exposedHeaders: 'content-disposition' }));

app.use(express.json());
app.use((error, req, res, next) => {
    if (error !== null) console.warn('ErrorJsonParse');
    next();
});
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.listen(PORT, () => {
    console.log('app listen on port: ' + PORT);
}); 
