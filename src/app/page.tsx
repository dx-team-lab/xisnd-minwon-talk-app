
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  const heroImage = PlaceHolderImages.find(img => img.id === 'project-1');

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4FF] items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-[1000px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Promotional Content */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-between relative overflow-hidden bg-white">
          <div className="z-10">
            <h1 className="text-3xl font-bold leading-tight mb-8">
              우리의 프로젝트를<br />
              <span className="text-black">영업정보시스템에서 쉽게 관리하세요 😛</span>
            </h1>
            
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-100 mt-4">
              <Image
                src={heroImage?.imageUrl || "https://picsum.photos/seed/auth/800/600"}
                alt="Dashboard Preview"
                fill
                className="object-cover"
                data-ai-hint="construction dashboard"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none" />
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center border-l border-slate-50">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    placeholder="이메일을 입력하세요"
                    className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary transition-all"
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
                    placeholder="비밀번호를 입력하세요"
                    className="pl-12 pr-12 h-14 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary transition-all"
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

              {/* Form Helpers */}
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
              <Button className="w-full h-14 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-lg font-bold shadow-lg shadow-blue-200 transition-all">
                {isLogin ? "로그인" : "회원가입"}
              </Button>
              
              <div className="flex items-center justify-between px-1">
                <button className="text-sm font-medium text-blue-600 hover:underline">
                  비밀번호를 잊으셨나요?
                </button>
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {isLogin ? "회원가입" : "로그인으로 돌아가기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-slate-400 text-sm font-medium">
          © XI S&D, All Rights Reserved. Designed & Developed by DX Team.
        </p>
      </footer>
    </div>
  );
}
