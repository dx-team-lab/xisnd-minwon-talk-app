
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser, useFirestore, initiateEmailSignIn, initiateEmailSignUp } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // Auth state listener to ensure profile exists on login/signup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // New user: Set default role to 'manager' (일반 권한) and approved to false
          await setDoc(userRef, {
            id: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName || authUser.email?.split('@')[0],
            role: 'manager',
            approved: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          // Existing user: just update last login/updatedAt
          await setDoc(userRef, {
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        initiateEmailSignIn(auth, email, password);
      } else {
        initiateEmailSignUp(auth, email, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setIsSubmitting(false);
    }
  };

  const heroImage = PlaceHolderImages.find(img => img.id === 'project-2');

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4FF]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4FF] items-center justify-center p-4">
      <div className="w-full max-w-[1000px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Promotional Content */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-between relative overflow-hidden bg-white">
          <div className="z-10">
            <h1 className="text-3xl font-bold leading-tight mb-8">
              건설 현장 민원 관리의 시작,<br />
              <span className="text-black">민원 커뮤니티에서 스마트하게 해결하세요 🛡️</span>
            </h1>
            
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-100 mt-4">
              <Image
                src={heroImage?.imageUrl || "https://picsum.photos/seed/auth/800/600"}
                alt="Construction Management"
                fill
                className="object-cover"
                data-ai-hint="construction communication"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none" />
            </div>
            <p className="mt-6 text-slate-500 text-sm leading-relaxed">
              체계적인 민원 데이터 분석을 통해 현장의 원활한 소통과 효율적인 보상 관리를 지원합니다.
            </p>
          </div>
          
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center border-l border-slate-50">
          <form onSubmit={handleAuth} className="max-w-md mx-auto w-full space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900">{isLogin ? "환영합니다!" : "회원가입"}</h2>
              <p className="text-slate-500 mt-2 text-sm">
                {isLogin ? "민원 커뮤니티 서비스 이용을 위해 로그인하세요." : "새로운 계정을 만들고 서비스를 시작하세요."}
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="pl-12 pr-12 h-14 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberEmail}
                      onCheckedChange={(checked) => setRememberEmail(checked as boolean)}
                      className="rounded-md border-slate-300"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none text-slate-600 cursor-pointer"
                    >
                      이메일 기억하기
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-lg font-bold shadow-lg shadow-blue-200 transition-all"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (isLogin ? "로그인" : "회원가입")}
              </Button>
              
              <div className="flex items-center justify-between px-1">
                <Link href="/forgot-password" size="sm" className="text-sm font-medium text-blue-600 hover:underline">
                  비밀번호를 잊으셨나요?
                </Link>
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있나요? 로그인"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-slate-400 text-sm font-medium">
          © MinwonTalk. All Rights Reserved. Designed & Developed by DX Team.
        </p>
      </footer>
    </div>
  );
}
