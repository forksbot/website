import Cmp from './cmp.svelte';

window.customElements.define('ui-accountdetails', class extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const classes = this.getAttribute("class");
        this.removeAttribute("class");
        this.cmp = new Cmp({ target: this, props: { classes } });
    }
    disconnectedCallback() {
        if (this.cmp) this.cmp.$destroy();
    }
});

