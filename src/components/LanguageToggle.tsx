import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// 다국어(언어 전환) 기능은 현재 숨김 처리되어 있습니다.
// 다시 노출하려면 아래 SHOW_LANGUAGE_TOGGLE 값을 true 로 변경하세요.
const SHOW_LANGUAGE_TOGGLE = false;

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "ko";

  if (!SHOW_LANGUAGE_TOGGLE) return null;


  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Change language">
          <Globe className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[100px]">
        <DropdownMenuItem
          onClick={() => changeLang("ko")}
          className={`text-xs ${currentLang === "ko" ? "font-bold bg-accent" : ""}`}
        >
          한국어
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLang("en")}
          className={`text-xs ${currentLang === "en" ? "font-bold bg-accent" : ""}`}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
