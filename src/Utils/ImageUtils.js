// src/utils/imageUtils.js
export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject("转换Base64失败: " + error);
    });
};

export const uploadImage = async (base64Image) => {
    if (!base64Image) {
        alert("请先选择图片！");
        return;
    }

    const imageId = `img_${Date.now()}`;

    try {
        const response = await fetch("http://127.0.0.1:5001/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image_id: imageId,
                image_path: `uploads/${imageId}.jpg`,
                features: base64Image, // 在Features中存入 Base64 数据
                image: base64Image, // 存 Base64 数据
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("上传失败", error);
        return { success: false, message: "上传失败" };
    }
};
