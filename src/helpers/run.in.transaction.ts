import connection from "db/connection";

export default async function runInTransaction(callback: Function) {
    // First, start a transaction
    const trans = await connection.transaction();

    try {
        await callback();

        // commit the transaction.
        await trans.commit();
    } catch (error) {
        // rollback the transaction.
        await trans.rollback();

        throw error;
    }
}