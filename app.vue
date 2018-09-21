<template>
    <div class="daily">
        <div class="daily-menu">
            <div class="daily-menu-item"
                 @click="handleToRecommend"
                :class="{ on: type === 'recommend' }">每日推荐</div>
            <div class="daily-menu-item"
                :class="{ on: type === 'daily' }"
                @click="showThemes = !showThemes">主题日报</div>
            <ul v-show="showThemes">
                <li v-for="item in themes">
                    <a :class="{ on: item.id === themeId && type === 'daily' }"
                        @click="handleToTheme(item.id)">{{item.name}}</a>
                </li>
            </ul>
        </div>
        <div class="daily-list" ref="list">
            <template v-if="type === 'recommend'">
                <div v-for="list in recommendList">
                    <div class="daily-data">{{formatDay(list.date)}}</div>
                    <Item
                        v-for="item in list.stories"
                        :data="item"
                        :key="item.id"></Item>
                </div>
            </template>
            <template v-if="type === 'daily'">
                <Item
                    v-for="item in list"
                    :data="item"
                    :key="item.id"></Item>
            </template>
        </div>
        <Item @click.native="handleClick(item.id)"></Item>
        <daily-article :id="articleId"></daily-article>
    </div>
</template>

<script>
    import $ from './libs/util';
    import Item from './components/item.vue';
    import dailyArticle from './components/daily-article.vue';

    export default {
        components: { Item, dailyArticle },
        data () {
            return {
                themes: [],
                showThemes: false,
                type: 'recommend',
                list: [],
                themesId: 0,
                recommendList: [],
                dailyTime: $.getTodayTime(),
                isLoading: false,
                articleId: 0
            }
        },
        methods: {
            getThemes(){
                // axios发起get请求
                $.ajax.get('themes').then(res => {
                    this.themes = res.others;
                })
            },
            handleToTheme(id){
                //改变菜单分类
                this.type = 'daily';
                //设置当前点击子类主题日报id
                this.themesId = id;
                //清空中间栏的数据
                this.list = [];
                $.ajax.get('theme/' + id).then(res=>{
                    //过滤某个类型的文章
                    this.list = res.stories.filter(item=>item.type !== 1);
                })
            },
            handleToRecommend(){
                this.type = 'recommend';
                this.recommendList = [];
                this.dailyTime = $.getTodayTime();
                this.getRecommendList();
            },
            getRecommendList(){
                this.isLoading = true;
                const prevDay = $.prevDay(this.dailyTime + 8640000);
                $.ajax.get('news/before/'+prevDay).then(res=>{
                    this.recommendList.push(res);
                    this.isLoading = false;
                })
            },
            //转换为带汉字的年月
            formatDay(date){
                let month = date.substr(4,2);
                let day = date.substr(6,2);
                if(day.substr(0, 1) === '0') month = month.substr(1,1);
                if(day.substr(0,1) == '0') day = day.substr(1,1);
                return `${month} 月 ${day} 日`;
            },
            handleClick (id){
                this.articleId = id;
            }
        },
        mounted(){
            //初始化调用
            this.getThemes();
            this.getRecommendList();
            //监听中栏滚动事件
            const $list = this.refs.list;
            $list.addEventListener('scroll', ()=>{
                //在主题日报或者加载推荐列表时停止操作
                if(this.type === 'daily' || this.isLoading) return;
                //向上卷去高度等于整个内容区域高度时，视为接触底部
                if($list.scrollTop + document.body.clientHeight >=  $list.scrollHeight){
                    // 时间减少一天
                    this.dailyTime -= 86400000;
                    this.getRecommendList();
                }
            })
        }
    }
</script>

<style scoped>
   .daily-menu ul{
       list-style: none;
   }
    .daily-menu ul li a{
        display: block;
        color: inherit;
        text-decoration: none;
        padding: 5px 0;
        margin: 5px 0;
        cursor: pointer;
    }
    .daily-menu ul li a:hover, .daily-menu ul li a.on{
        color: #3399ff;
    }
</style>