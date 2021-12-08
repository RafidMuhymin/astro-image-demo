import { imagetools } from "vite-imagetools";
// import { imagetools } from "./astro-imagetools/index.mjs";

export default {
  vite: {
    plugins: [imagetools()],
  },
  image: {
    formats: ["webp", "png", "jpg", "jpeg", "gif"],
  },
};
