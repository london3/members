import { PostForm } from "../post-form";

export default function NewPostPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">新規投稿</h1>
      <PostForm />
    </div>
  );
}
