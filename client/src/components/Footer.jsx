import { assets } from "../assets/assets";
const  Footer = ()=> {
    return (
        <footer className="px-6 mt-20 md:px-16 lg:px-24 xl:px-32 pt-8 w-full dark-text-secondary">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b dark-border pb-6">
                <div className="md:max-w-96">
                    <img className="h-9" src={assets.logo} alt="dummyLogoDark" />
                    <p className="mt-6 text-sm dark-text-secondary">
                       Experience the power of AI with QuickAI. <br />
                                               Transform your content creation with our suite of premium AI tools.
                       Write articles, generate images, and enhance your workflow
                    </p>
                </div>
                <div className="flex-1 flex items-start md:justify-end gap-20">
                    <div>
                        <h2 className="font-semibold mb-5 dark-text">Company</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">About us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold dark-text mb-5">Subscribe to our newsletter</h2>
                        <div className="text-sm space-y-2">
                            <p className="dark-text-secondary">The latest news, articles, and resources, sent to your inbox weekly.</p>
                            <div className="flex items-center gap-2 pt-4">
                                <input className="border dark-border bg-dark-card dark-text placeholder-gray-400 focus:ring-2 ring-primary outline-none w-full max-w-64 h-9 rounded px-2" type="email" placeholder="Enter your email" />
                                <button className="bg-primary w-24 h-9 text-white rounded cursor-pointer hover:bg-primary/90 transition-colors">Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-xs md:text-sm pb-5 cursor-pointer dark-text-secondary">
                Copyright 2025 © <a href="https://www.linkedin.com/in/abhishek-thakur-b50828280/" className="text-primary hover:underline">QuickAI</a>. All Rights Reserved.
            </p>
        </footer>
    );
};

export default Footer ;