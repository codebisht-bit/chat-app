const CLOUD_NAME = "doiniw1jk";
const UPLOAD_PRESET = "chat-app";

const upload = async (file) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  return data.secure_url;
};

export default upload;