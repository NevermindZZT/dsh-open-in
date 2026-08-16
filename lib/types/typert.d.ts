/**
 * The hand-written host Typert manifest for the openIn Remote. Registered
 * through `ctx.typert.register` in the plugin body, it claims the wire
 * endpoints through the strict registry — the same path generated `./typert`
 * artifacts use — so the Host Gateway resolves and invokes `openIn/*`
 * without consulting the `@Remote` marker table. That marker independence
 * matters in source-launch environments where the gateway and a
 * profile-loaded plugin bundle can hold separate copies of the decorator
 * module state.
 */
import type { TypertContribution } from '@deepseek-ai/dsh-typert-registry/types';
/** The openIn namespace's host manifest (strict codecs shared with the client). */
export declare const TYPERT_MANIFEST: TypertContribution;
