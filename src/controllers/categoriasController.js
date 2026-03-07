
import db from "../config/db.js";

export const listarCategorias = async (req, res, next) => {
    try {
        const [categorias] = await db.promise().query("SELECT * FROM categorias ORDER BY nombre ASC");
        res.json(categorias);
    } catch (error) {
        next(error);
    }
};
