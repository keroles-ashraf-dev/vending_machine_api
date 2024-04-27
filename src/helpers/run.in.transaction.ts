import connection from "db/connection";

export default async function runInTransaction(callback: Function): Promise<any> {
    // First, start a transaction
    const trans = await connection.transaction();

    try {
        const res = await callback();

        // commit the transaction.
        await trans.commit();

        return res;
    } catch (error) {
        // rollback the transaction.
        await trans.rollback();

        throw error;
    }
}