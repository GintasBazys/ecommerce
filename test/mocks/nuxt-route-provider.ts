import { defineComponent, h } from 'vue'

export const RouteProvider = defineComponent({
    name: 'RouteProvider',
    props: {
        vnode: {
            type: null,
            required: false,
            default: null
        }
    },
    setup(props) {
        return () => props.vnode ? h(props.vnode) : null
    }
})