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

    // 将 Base64 图片上传到后端并返回处理结果，支持取消请求
    static async uploadImage(base64Image, num = 5, abortSignal) {
        try {
            const response = await fetch('http://127.0.0.1:5001/relay_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_base64: base64Image,
                    num: num // 请求返回的相似图像数量
                }),
                signal: abortSignal // 支持取消的 AbortSignal
            });

            if (!response.ok) {
                throw new Error('上传失败');
            }

            const data = await response.json();

            // 保存请求ID以供取消使用
            if (data.request_id) {
                this.currentRequestId = data.request_id;
            }

            return data.results || data; // 兼容新旧接口返回格式
        } catch (error) {
            // 区分网络取消和其他错误
            if (error.name === 'AbortError') {
                console.log('请求被用户取消');
                // 如果我们有当前请求的ID，尝试通知后端取消
                if (this.currentRequestId) {
                    await this.cancelRequest(this.currentRequestId).catch(e =>
                        console.error('通知后端取消请求失败:', e)
                    );
                }
                throw new Error('请求已取消');
            }

            console.error('上传失败:', error);
            throw error;
        }
    }

    // 通知后端取消正在处理的请求
    static async cancelRequest(requestId) {
        try {
            const response = await fetch(`http://127.0.0.1:5001/cancel_request/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            console.log('取消请求结果:', result);
            return result;
        } catch (error) {
            console.error('发送取消请求失败:', error);
            throw error;
        } finally {
            // 清除当前请求ID
            this.currentRequestId = null;
        }
    }

    // 存储当前请求ID
    static currentRequestId = null;
}