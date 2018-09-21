// 导入vue
import Vue from 'vue';

//导入app.vue组件
import App from './app.vue';

import './style.css';

//创建vue根实例
new Vue({
    el: '#app',
    render: h => h(App)
});