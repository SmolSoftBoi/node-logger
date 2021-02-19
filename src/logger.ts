import { format } from 'util';

import chalk from 'chalk';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Log levels to indicate importance of the logged message.
 * Every level corresponds to a certain color.
 * Messages with debug level are only displayed if explicitly enabled.
 */
export const enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    DEBUG = 'debug',
}

/**
 * Represents a logging device which can be used directly as a function (for info logging)
 * but also has dedicated logging functions for respective logging levels.
 */
export interface Logging {

    /** Prefix */
    prefix: string;

    (message: string, ...parameters: any[]): void;

    /**
     * Info
     * @param message Message.
     * @param parameters Parameters.
     */
    info(message: string, ...parameters: any[]): void;

    /**
     * Warn
     * @param message Message.
     * @param parameters Parameters.
     */
    warn(message: string, ...parameters: any[]): void;

    /**
     * Error
     * @param message Message.
     * @param parameters Parameters.
     */
    error(message: string, ...parameters: any[]): void;

    /**
     * Debug
     * @param message Message.
     * @param parameters Parameters.
     */
    debug(message: string, ...parameters: any[]): void;

    /**
     * Log
     * @param level Level.
     * @param message Message.
     * @param parameters Parameters.
     */
    log(level: LogLevel, message: string, ...parameters: any[]): void;
}

/**
 * Auxiliary interface used to correctly type stuff happening in `withPrefix`.
 */
interface IntermediateLogging {

    /** Prefix */
    prefix?: string;

    (message: string, ...parameters: any[]): void;

    /**
     * Info
     * @param message Message.
     * @param parameters Parameters.
     */
    info?(message: string, ...parameters: any[]): void;

    /**
     * Warn
     * @param message Message.
     * @param parameters Parameters.
     */
    warn?(message: string, ...parameters: any[]): void;

    /**
     * Error
     * @param message Message.
     * @param parameters Parameters.
     */
    error?(message: string, ...parameters: any[]): void;

    /**
     * Debug
     * @param message Message.
     * @param parameters Parameters.
     */
    debug?(message: string, ...parameters: any[]): void;

    /**
     * Log
     * @param level Level.
     * @param message Message.
     * @param parameters Parameters.
     */
    log?(level: LogLevel, message: string, ...parameters: any[]): void;
}

/** Logger */
export class Logger {

    /** Internal */
    public static readonly internal = new Logger();

    /**
     * Global cache of logger instances by name.
     */
    private static readonly loggerCache = new Map<string, Logging>();

    /** Debug Enabled? */
    private static debugEnabled = false;

    /** Timestamp Enabled? */
    private static timestampEnabled = true;

    /** Prefix */
    readonly prefix?: string;

    /**
     * @param prefix Prefix.
     */
    constructor(prefix?: string) {
        this.prefix = prefix;
    }

    /**
     * Creates a new logging device with a specified prefix.
     * @param prefix Prefix. 
     * @returns Logging.
     */
    static withPrefix(prefix: string): Logging {
        const loggerStuff = Logger.loggerCache.get(prefix);

        if (loggerStuff) {
            return loggerStuff;
        } else {
            const logger = new Logger(prefix);

            const log: IntermediateLogging = logger.info.bind(logger);
            log.info = logger.info;
            log.warn = logger.warn;
            log.error = logger.error;
            log.debug = logger.debug;
            log.log = logger.log;

            log.prefix = logger.prefix;


            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const logging: Logging = log;
            Logger.loggerCache.set(prefix, logging);
            return logging;
        }
    }

    /**
     * Turns on debug level logging. Off by default.
     * @param enabled Enabled?
     */
    public static setDebugEnabled(enabled = true): void {
        Logger.debugEnabled = enabled;
    }

    /**
     * Turns on inclusion of timestamps in log messages. On by default.
     * @param enabled Enabled?
     */
    public static setTimestampEnabled(enabled = true): void {
        Logger.timestampEnabled = enabled;
    }

    /**
     * Forces color in logging output, even if it seems like color is unsupported.
     */
    public static forceColor(): void {
        chalk.level = 1; // `1` - Basic 16 colors support.
    }

    /**
     * Info
     * @param message Message.
     * @param parameters Parameters.
     */
    public info(message: string, ...parameters: any[]): void {
        this.log(LogLevel.INFO, message, ...parameters);
    }
    
    /**
     * Warn
     * @param message Message.
     * @param parameters Parameters.
     */
    public warn(message: string, ...parameters: any[]): void {
        this.log(LogLevel.WARN, message, ...parameters);
    }

    /**
     * Error
     * @param message Message.
     * @param parameters Parameters.
     */
    public error(message: string, ...parameters: any[]): void {
        this.log(LogLevel.ERROR, message, ...parameters);
    }

    /**
     * Debug
     * @param message Message.
     * @param parameters Parameters.
     */
    public debug(message: string, ...parameters: any[]): void {
        if (Logger.debugEnabled) {
            this.log(LogLevel.DEBUG, message, ...parameters);
        }
    }

    /**
     * Log
     * @param level Level.
     * @param message Message.
     * @param parameters Parameters.
     */
    public log(level: LogLevel, message: string, ...parameters: any[]): void {
        message = format(message, ...parameters);
    
        let loggingFunction = console.log;
        switch (level) {
            case LogLevel.WARN:
                message = chalk.yellow(message);
                loggingFunction = console.error;
                break;
            case LogLevel.ERROR:
                message = chalk.red(message);
                loggingFunction = console.error;
                break;
            case LogLevel.DEBUG:
                message = chalk.gray(message);
                break;
        }
    
        if (this.prefix) {
            message = chalk.cyan(`[${this.prefix}] `) + message;
        }
    
        if (Logger.timestampEnabled) {
            const date = new Date();
            message = chalk.white(`[${date.toLocaleString()}] `) + message;
        }
    
        loggingFunction(message);
    }
}

