import { useState } from "react"
import { heroSectionData } from "../assets/assets";
import { Link } from "react-router-dom";
import { BikeIcon, Loader2Icon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
    const [isLoginState, setIsLoginState] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLoginState) {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
        } catch (error: unknown) {
            if(error instanceof Error) {
                toast.error(error.message);
            }
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen flex">
            {/* Left Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
                <img src={heroSectionData.hero_image} alt="" className="absolute inset-0 object-cover h-full bg-center opacity-10" />
                <div className="relative text-center px-12">
                    <h2 className="text-4xl font-semibold text-white mb-4">Welcome Back to GroceShop</h2>
                    <p className="text-white/60 font-serif text-xl max-w-sm mx-auto">Fresh groceries and organic produce, delivered to your doorstep.</p>
                </div>
            </div>

            {/* Right Side Form */}
            <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <BikeIcon className="size-7 text-app-green" />
                            <span className="text-2xl font-semibold text-app-green">GroceShop</span>
                        </Link>
                        <h1 className="text-2xl font-semibold text-app-green mb-2">
                            {isLoginState ? "Sign in to your account" : "Create your account"}
                        </h1>
                        <p className="text-sm text-app-text-light">
                            {isLoginState ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => setIsLoginState(!isLoginState)} className="text-app-orange ml-1 font-semibold hover:text-app-orange-dark transition-colors">
                                {isLoginState ? "Create one" : "Sign in"}
                            </button>
                        </p>
                    </div>

                    {/* Login / Register Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5">
                        {!isLoginState && (
                            <div>
                                <label className="block text-sm font-medium text-app-green mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Your name"
                                    className="w-full px-4 py-2.5 rounded-xl border not-focus:border-app-border text-sm transition-colors" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 rounded-xl border not-focus:border-app-border text-sm transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl border not-focus:border-app-border text-sm transition-colors" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-60">
                            {loading ? <Loader2Icon className="animate-spin mx-auto" /> : isLoginState ? "Sign In" : "Sign Up"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login