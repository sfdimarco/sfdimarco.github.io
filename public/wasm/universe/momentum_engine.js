/* @ts-self-types="./momentum_engine.d.ts" */

export class MomentumEngine {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MomentumEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_momentumengine_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    buffer_len() {
        const ret = wasm.momentumengine_buffer_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Zero-copy bridge — JS creates Float32Array view over this pointer
     * @returns {number}
     */
    buffer_ptr() {
        const ret = wasm.momentumengine_buffer_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * THE HOT PATH — called once per frame per variable.
     * No allocations. This is where WASM earns its keep.
     * @param {number} var_index
     * @param {number} value
     * @param {number} dt
     */
    compute_state(var_index, value, dt) {
        wasm.momentumengine_compute_state(this.__wbg_ptr, var_index, value, dt);
    }
    /**
     * @returns {number}
     */
    dominant_family() {
        const ret = wasm.momentumengine_dominant_family(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} var_index
     * @returns {number}
     */
    get_error_dist(var_index) {
        const ret = wasm.momentumengine_get_error_dist(this.__wbg_ptr, var_index);
        return ret;
    }
    /**
     * @param {number} var_index
     * @returns {number}
     */
    get_loop_family(var_index) {
        const ret = wasm.momentumengine_get_loop_family(this.__wbg_ptr, var_index);
        return ret;
    }
    constructor() {
        const ret = wasm.momentumengine_new();
        this.__wbg_ptr = ret >>> 0;
        MomentumEngineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @param {number} pos_x
     * @param {number} pos_y
     * @returns {number}
     */
    register_var(value, min, max, pos_x, pos_y) {
        const ret = wasm.momentumengine_register_var(this.__wbg_ptr, value, min, max, pos_x, pos_y);
        return ret >>> 0;
    }
    reset() {
        wasm.momentumengine_reset(this.__wbg_ptr);
    }
    /**
     * @param {number} var_index
     * @param {number} min
     * @param {number} max
     */
    set_bounds(var_index, min, max) {
        wasm.momentumengine_set_bounds(this.__wbg_ptr, var_index, min, max);
    }
    /**
     * @param {number} var_index
     * @param {number} pos_x
     * @param {number} pos_y
     */
    set_position(var_index, pos_x, pos_y) {
        wasm.momentumengine_set_position(this.__wbg_ptr, var_index, pos_x, pos_y);
    }
    /**
     * @returns {number}
     */
    var_count() {
        const ret = wasm.momentumengine_var_count(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) MomentumEngine.prototype[Symbol.dispose] = MomentumEngine.prototype.free;

/**
 * GEO mask system — 4-bit quadrant masks per loop family per tick
 * @param {number} family
 * @param {number} tick
 * @returns {number}
 */
export function get_mask(family, tick) {
    const ret = wasm.get_mask(family, tick);
    return ret;
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_81fc77679af83bc6: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./momentum_engine_bg.js": import0,
    };
}

const MomentumEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_momentumengine_free(ptr >>> 0, 1));

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('momentum_engine_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
