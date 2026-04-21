/* tslint:disable */
/* eslint-disable */

export class MomentumEngine {
    free(): void;
    [Symbol.dispose](): void;
    buffer_len(): number;
    /**
     * Zero-copy bridge — JS creates Float32Array view over this pointer
     */
    buffer_ptr(): number;
    /**
     * THE HOT PATH — called once per frame per variable.
     * No allocations. This is where WASM earns its keep.
     */
    compute_state(var_index: number, value: number, dt: number): void;
    dominant_family(): number;
    get_error_dist(var_index: number): number;
    get_loop_family(var_index: number): number;
    constructor();
    register_var(value: number, min: number, max: number, pos_x: number, pos_y: number): number;
    reset(): void;
    set_bounds(var_index: number, min: number, max: number): void;
    set_position(var_index: number, pos_x: number, pos_y: number): void;
    var_count(): number;
}

/**
 * GEO mask system — 4-bit quadrant masks per loop family per tick
 */
export function get_mask(family: number, tick: number): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_momentumengine_free: (a: number, b: number) => void;
    readonly get_mask: (a: number, b: number) => number;
    readonly momentumengine_buffer_len: (a: number) => number;
    readonly momentumengine_buffer_ptr: (a: number) => number;
    readonly momentumengine_compute_state: (a: number, b: number, c: number, d: number) => void;
    readonly momentumengine_dominant_family: (a: number) => number;
    readonly momentumengine_get_error_dist: (a: number, b: number) => number;
    readonly momentumengine_get_loop_family: (a: number, b: number) => number;
    readonly momentumengine_new: () => number;
    readonly momentumengine_register_var: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly momentumengine_reset: (a: number) => void;
    readonly momentumengine_set_bounds: (a: number, b: number, c: number, d: number) => void;
    readonly momentumengine_set_position: (a: number, b: number, c: number, d: number) => void;
    readonly momentumengine_var_count: (a: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
