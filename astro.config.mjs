import { imagetools } from "vite-imagetools";

export default {
  vite: {
    plugins: [imagetools()],
  },
  image: {
    formats: ["webp", "png", "jpg", "jpeg", "gif"],
  },
};
