export declare function createHttpServer(): {
    app: import("express-serve-static-core").Express;
    bot: import("telegraf").Telegraf<import("telegraf").Context<import("@telegraf/types").Update>>;
};
export declare function startServer(): void;
