import { createWebHistory, createRouter } from "vue-router";
import Home from "@/components/Home.vue";
import ImageDetail from "@/components/ImageDetail.vue";

const history = createWebHistory();

const router = createRouter({
  history,
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/image/:id",
      name: "ImageDetail",
      component: ImageDetail,
      props: (route) => ({ id: route.params.id }),
    },
  ],
});

export default router;
