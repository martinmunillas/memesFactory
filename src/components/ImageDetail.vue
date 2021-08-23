<template>
  <div>
    <div v-if="!loading">
      <img :src="image.url" />
      {{ image.score }} points
      <p v-for="comment in comments" :key="comment.createdAt">
        {{ comment.comment }}
      </p>
      <form @submit="postComment">
        <input v-model="comment" :disabled="loadingComment" />
        <button type="submit" :disabled="loadingComment">post</button>
      </form>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { firestore, GCP_KEY } from "@/main";
import type { Image } from "./Home.vue";
import axios from "axios";

interface Comment {
  comment: string;
  imageId: string;
  createdAt: number;
  score: number;
}

interface Data {
  loadingComment: boolean;
  comment: string;
  loading: boolean;
  image: Image | undefined;
  id?: string;
  comments: Comment[];
}

export default defineComponent({
  name: "ImageDetail",
  props: { id: String },
  data: (): Data => ({
    loadingComment: false,
    comment: "",
    loading: true,
    image: undefined,
    comments: [],
  }),
  async mounted() {
    const snapshot = await firestore.collection("images").doc(this.id).get();
    this.image = snapshot.data() as unknown as Image;
    const comments: Comment[] = [];
    const snapshots = await firestore
      .collection("comments")
      .where("imageId", "==", this.id)
      .get();
    snapshots.forEach((snapshot) => {
      comments.push(snapshot.data() as unknown as Comment);
    });
    this.comments = comments;
    this.loading = false;
  },
  methods: {
    async postComment(e: Event) {
      e.preventDefault();
      this.loadingComment = true;

      const { data } = await axios.post(
        `https://language.googleapis.com/v1/documents:analyzeSentiments?key=${GCP_KEY}`,
        {
          document: {
            type: "PLAIN_TEXT",
            language: "ES",
            content: this.comment,
          },
          encodingType: "UTF8",
        }
      );

      const score = data.documentSentiment.score;

      await firestore.collection("comments").add({
        comment: this.comment,
        imageId: this.id,
        createdAt: Date.now(),
        score,
      });

      await this.refetchComments();
      this.comment = "";
      this.loadingComment = false;

      const averageScore =
        this.comments.reduce((acc, curr) => acc + curr.score, 0) /
        this.comments.length;

      await firestore.collection("images").doc(this.id).set({
        score: averageScore,
      });
    },
    async refetchComments() {
      const comments: Comment[] = [];
      const snapshots = await firestore
        .collection("comments")
        .where("imageId", "==", this.id)
        .get();
      snapshots.forEach((snapshot) => {
        comments.push(snapshot.data() as unknown as Comment);
      });
      this.comments = comments;
    },
  },
});
</script>

<style scoped></style>
