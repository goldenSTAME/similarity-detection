export class ImageUtils {
    // 将文件转换为 Base64 字符串
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                resolve(base64String);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file); // 读取文件并触发 onloadend
        });
    }

    // 将 Base64 图片上传到后端并返回处理结果
    static async uploadImage(base64Image, num = 5) {
        try {
            const response = await fetch('http://127.0.0.1:5001/relay_image', { // 假设后端 API 地址为 /relay_image
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_base64: base64Image,
                    num: num // 请求返回的相似图像数量
                }),
            });

            if (!response.ok) {
                throw new Error('上传失败');
            }

            const data = await response.json();
            return data; // 返回后端处理后的结果（包含图像 ID、相似度、图像数据）
        } catch (error) {
            console.error('上传失败:', error);
            throw error;
        }
    }
}
