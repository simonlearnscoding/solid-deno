const MAX = 5 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type OkType = (typeof OK_TYPES)[number];

export type SavedImage = {
  filename: string;
  diskPath: string;
  publicUrl: string;
  mime: OkType;
  bytes: number;
};

export async function saveImageToUploads(
  file: File,
  subdir = "avatars",
): Promise<SavedImage> {
  if (!OK_TYPES.includes(file.type as OkType)) {
    throw new Error("Unsupported image type");
  }
  if (file.size > MAX) throw new Error("Image too large");

  // (optional) sniff first bytes here if you want extra safety

  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const dir = `uploads/${subdir}`;
  await Deno.mkdir(dir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${ext}`;
  const diskPath = `${dir}/${filename}`;
  await Deno.writeFile(diskPath, bytes);

  return {
    filename,
    diskPath,
    publicUrl: `/uploads/${subdir}/${filename}`,
    mime: file.type as OkType,
    bytes: file.size,
  };
}
