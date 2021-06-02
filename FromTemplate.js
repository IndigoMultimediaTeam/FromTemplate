/* Slouží k importování statické HTML části dříve definované v souboru uvnitř `<template id="…">…</template>`
 * Pro spárování slouží ID `<template>` a atribut `use` ⇒ `<from-template use="…"></from-template>`
 * Užitečné poznámky:
 * - lze naslouchat `onload` událost
 * - lze použít `<slot>`/`[slot]`:
 *   - pro spárovaní dynamické části (v „statickém” smyslu při vytváření elementu)
 *   - poznámka – simuluje chování web komponent se `shadowRoot`
 * Ukázka:
 * <template id="T_test">
 *     <div style="color: red">
 *         <p>TEST: line one</p>
 *         <slot></slot>
 *         <p>TEST: line three</p>
 *         <p style="color: grey"><slot name="test"></slot></p>
 *     </div>
 * </template>
 * <from-template use="T_test">
 *     <p>TEST: line two</p>
 *     <p slot="test">Jiný</p>
 * </from-template>
 */
(function FromTemplate(){
    class FromTemplateElement extends HTMLElement{
        static get tag_name(){ return "from-template"; }
        connectedCallback(){
            const els_hosts= Array.from(this.children);
            const use= this.getAttribute("use");
            /** @type {HTMLTemplateElement} */
            const template_el= document.getElementById(use);
            this.appendChild(document.importNode(template_el.content, true));

            this.dispatchEvent(new CustomEvent("load"));
            if(!els_hosts.length) return false;
            const els_slots= toElsNamesDictionary(this.querySelectorAll("slot"));
            for(const el of els_hosts)
                replace(Reflect.get(els_slots, el.slot), el);
        }
    }
    customElements.define(FromTemplateElement.tag_name, FromTemplateElement);

    function replace(el_slot, el_host){
        if(!el_slot) return false;
        el_slot.parentElement.insertBefore(el_host, el_slot);
        el_slot.remove();
    }
    function toElsNamesDictionary(els_query){
        return Array.from(els_query).reduce((o, el)=> (Reflect.set(o, el.name, el), o), {});
    }
})();
