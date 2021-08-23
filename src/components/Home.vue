<template>
  <div>
    <div v-if="!loading">
      <input type="file" ref="fileInput" id="file" @change="processFile" />
      <button @click="uploadFile">Upload</button>

      <h1>Memes</h1>
      <div class="memes">
        <router-link
          v-for="image in images"
          :key="image.createdAt"
          class="meme"
          :to="`/image/${image.id}`"
        >
          <img :src="image.url" />
          {{ image.score }} points
        </router-link>
      </div>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { storage, firestore, GCP_KEY } from "@/main";
import axios from "axios";

export interface Image {
  name: string;
  url: string;
  meta: { contentType: string };
  count: number;
  createdAt: number;
  labels: string[];
  id?: string;
}

interface Data {
  file: File | undefined;
  loading: boolean;
  images: Image[];
}

export default defineComponent({
  name: "Home",
  props: {},
  data: (): Data => ({
    file: undefined,
    loading: true,
    images: [],
  }),
  async mounted() {
    const snapshots = await firestore.collection("images").get();
    const images: Image[] = [];
    snapshots.forEach((snapshot) => {
      images.push({ ...snapshot.data(), id: snapshot.id } as unknown as Image);
    });
    this.loading = false;
    this.images = images;
  },
  methods: {
    processFile(e: Event) {
      this.file = (e.target as HTMLInputElement)?.files?.[0];
    },
    async uploadFile() {
      if (!this.file) {
        alert("No Input File");
        return;
      }
      const name = `${Date.now()}-${this.file.name}`;
      const meta = { contentType: this.file.type };
      this.loading = true;
      const snapshot = await storage.child(name).put(this.file, meta);
      const url = await snapshot.ref.getDownloadURL();

      const input = this.$refs.fileInput as HTMLInputElement;
      if (input) {
        input.type = "text";
        input.type = "file";
      }

      const { data } = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${GCP_KEY}`,
        {
          requests: [
            {
              features: [
                {
                  type: "LABEL_DETECTION",
                },
              ],
              image: {
                source: { imageUri: url },
              },
            },
          ],
        }
      );

      console.log(data);

      const labels = data.labelAnnotations
        .slice(0, 10)
        .map((label: { description: string }) => label.description);

      await firestore.collection("images").add({
        url,
        name,
        meta,
        createdAt: new Date().valueOf(),
        score: 0,
        labels,
      });
      this.loading = false;
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.meme {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #eeeeee;
  border-radius: 7px;
  padding: 20px;
}

.memes {
  padding: 50px;
  display: grid;
  grid-template-columns: repeat(auto-fit, 270px);
  gap: 20px;
}

img {
  max-width: 100%;
  max-height: 100%;
}
</style>
