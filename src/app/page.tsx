"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: "🎓",
      title: "إدارة ذكية",
      description: "نظام متكامل لإدارة الاختبارات من البداية للنهاية",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: "⚡",
      title: "تصحيح تلقائي",
      description: "تصحيح فوري للأسئلة الاختيارية وصح/خطأ",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: "📊",
      title: "تقارير شاملة",
      description: "إحصائيات وتقارير تفصيلية لكل طالب وصف",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: "🔒",
      title: "أمان متقدم",
      description: "حماية متعددة المستويات للبيانات والصلاحيات",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: "📱",
      title: "واجهة متجاوبة",
      description: "تصميم عصري يعمل على جميع الأجهزة",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: "🎯",
      title: "سهل الاستخدام",
      description: "واجهة بسيطة وسلسة لجميع المستخدمين",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const stats = [
    { value: "6", label: "مدارس", icon: "🏫" },
    { value: "4", label: "مواد دراسية", icon: "📚" },
    { value: "5", label: "أدوار", icon: "👥" },
    { value: "100%", label: "أمان", icon: "🔐" },
  ];

  return (
    <div className="min-h-screen">
      {/* ============================================
          🌟 Hero Section
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-hero"></div>

        {/* Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float animation-delay-400"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* Logo/Brand */}
            <div className="mb-8 inline-block">
              <div className="animate-bounce">
                <Image
                  src="/anjal-logo.png"
                  alt="شعار مدارس الأنجال"
                  width={150}
                  height={150}
                  className="mx-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slideDown">
              نظام اختبارات القبول
              <span className="block text-3xl md:text-5xl mt-4 text-white/90">
                مدارس الأنجال الأهلية والدولية
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-slideUp animation-delay-200">
              منصة متكاملة لإدارة اختبارات القبول بكفاءة عالية وأمان متقدم
              <br />
              <span className="text-white/80">
                ✨ تجربة سلسة لجميع المستخدمين
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scaleIn animation-delay-400">
              <Link
                href="/auth/staff"
                className="group relative px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span>🔐</span>
                  <span>تسجيل دخول الموظفين</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </Link>

              <Link
                href="/auth/student"
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white hover:text-purple-600 transition-all duration-300 hover:-translate-y-2"
              >
                <span className="flex items-center gap-3">
                  <span>👨‍🎓</span>
                  <span>تسجيل دخول الطلاب</span>
                </span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto animate-fadeIn animation-delay-600">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* ============================================
          ✨ Features Section
          ============================================ */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              <span className="gradient-text">مميزات النظام</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نوفر لك كل ما تحتاجه لإدارة اختبارات القبول بكفاءة واحترافية
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group card hover-lift cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className={`text-6xl mb-4 inline-block bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent animate-float`}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Line */}
                <div
                  className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} rounded-full transition-all duration-500 mt-4`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          📞 Footer Section
          ============================================ */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>🎓</span>
                <span>نظام اختبارات القبول</span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                نظام متكامل لإدارة اختبارات قبول الطلاب في مدارس الأنجال الأهلية
                والدولية
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/auth/staff"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    🔐 تسجيل دخول الموظفين
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/student"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    👨‍🎓 تسجيل دخول الطلاب
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-bold mb-4">معلومات التواصل</h4>
              <div className="space-y-2 text-gray-300">
                <p>🏫 مدارس الأنجال الأهلية والدولية</p>
                <p>💻 قسم الحاسب الآلي</p>
                <p>👨‍💼 إشراف: أستاذ هشام يسري</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-8">
            {/* Bottom Footer */}
            <div className="text-center space-y-2">
              <p className="text-gray-300">
                © {new Date().getFullYear()} جميع الحقوق محفوظة - مدارس الأنجال
                الأهلية والدولية
              </p>
              <p className="text-sm text-gray-400">
                قسم الحاسب الآلي - إشراف: أستاذ هشام يسري
              </p>
              <p className="text-xs text-gray-500 mt-2">
                تم التطوير بواسطة قسم الحاسب الآلي
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
