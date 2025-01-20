import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TranslatePage } from './pages/TranslatePage';
import { CaloriePage } from './pages/CaloriePage';
import { NavigatePage } from './pages/NavigatePage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/translate" element={<TranslatePage />} />
                <Route path="/calorie" element={<CaloriePage />} />
                <Route path="/navigate" element={<NavigatePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App; 