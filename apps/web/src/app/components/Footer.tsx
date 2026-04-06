import { Github, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                <span className="text-2xl font-bold">TICKETWAVE</span>
              </div>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Nền tảng đặt vé concert hàng đầu. Trải nghiệm âm nhạc trực tiếp chưa từng có.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground">
          <p>&copy; 2026 TicketWave. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
