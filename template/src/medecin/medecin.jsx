import Navigation from "./navigation";  // Change from { Navigation } to just Navigation
import { useState } from 'react';

export default function Doctor() {
    const [landingPageData, setLandingPageData] = useState({});
    
    return (
        <div>
            <Navigation></Navigation>
        </div>
    )
}