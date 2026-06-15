import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* 히어로 섹션 */}
      <section className="text-center py-16">
        <div className="text-8xl mb-6">🍠</div>
        <h1 className="text-5xl font-bold text-purple-700 mb-4">
          고구마마켓
        </h1>
        <p className="text-xl text-purple-400 mb-8">
          달콤하고 따뜻한 중고거래 ✨
        </p>

        {user ? (
          <div className="goguma-card inline-block px-8 py-6">
            <p className="text-purple-600 text-lg font-semibold mb-4">
              안녕하세요! 오늘도 좋은 거래 하세요 🌟
            </p>
            <Link href="/products" className="goguma-btn">
              상품 둘러보기 🛍️
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="goguma-btn text-lg px-8 py-3">
              지금 시작하기 🍠
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center text-purple-600 border-2 border-purple-300 hover:border-purple-500 px-8 py-3 rounded-2xl font-bold transition-colors text-lg"
            >
              로그인
            </Link>
          </div>
        )}
      </section>

      {/* 특징 카드 */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <div className="goguma-card p-6 text-center">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="font-bold text-purple-700 text-lg mb-2">믿을 수 있는 거래</h3>
          <p className="text-purple-400 text-sm">
            이웃과 함께하는<br />안전하고 따뜻한 거래
          </p>
        </div>
        <div className="goguma-card p-6 text-center">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="font-bold text-purple-700 text-lg mb-2">착한 가격</h3>
          <p className="text-purple-400 text-sm">
            필요한 물건을<br />합리적인 가격에
          </p>
        </div>
        <div className="goguma-card p-6 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="font-bold text-purple-700 text-lg mb-2">환경도 살리고</h3>
          <p className="text-purple-400 text-sm">
            중고거래로 함께<br />지구를 지켜요
          </p>
        </div>
      </section>

      {/* 개발 중 안내 */}
      <div className="mt-12 goguma-card p-6 text-center border-yellow-200 bg-yellow-50/80">
        <p className="text-yellow-700 font-semibold">🚧 개발 중인 서비스예요!</p>
        <p className="text-yellow-500 text-sm mt-1">
          현재는 회원가입/로그인, 상품 등록 기능을 사용할 수 있어요. 더 많은 기능이 곧 추가될 예정이에요 ✨
        </p>
      </div>
    </div>
  );
}
