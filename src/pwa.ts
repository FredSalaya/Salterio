import { registerSW } from 'virtual:pwa-register'

registerSW({
    immediate: true,
    onNeedRefresh() {
        console.log('New content available, click on reload button to update.')
    },
    onOfflineReady() {
        console.log('Show offline ready prompt')
    },
})
