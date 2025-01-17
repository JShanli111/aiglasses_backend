import MessengerProcessor from '../components/ImageProcessing/MessengerProcessor';

const ImageProcessing = () => {
    return (
        <div>
            <h1>图片处理</h1>
            
            <div>
                <h2>翻译功能</h2>
                <MessengerProcessor processType="translate" />
            </div>
            
            <div>
                <h2>卡路里分析</h2>
                <MessengerProcessor processType="calorie" />
            </div>
            
            <div>
                <h2>导航避障</h2>
                <MessengerProcessor processType="navigate" />
            </div>
        </div>
    );
};

export default ImageProcessing; 