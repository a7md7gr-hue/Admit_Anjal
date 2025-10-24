import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-4 text-sm text-gray-500">
      <div className="container mx-auto px-6 text-center">
        <p className="mb-1">
          © {new Date().getFullYear()} جميع الحقوق محفوظة - مدارس الأنجال
          الأهلية والدولية
        </p>
        <p className="text-xs">قسم الحاسب الآلي</p>
      </div>
    </footer>
  );
};

export default Footer;
