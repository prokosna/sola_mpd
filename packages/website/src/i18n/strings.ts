export type Locale = "en" | "ja";

export type Feature = {
	title: string;
	description: string;
};

export type Screenshot = {
	src: string;
	caption: string;
	note?: string;
};

export type InstallStep = {
	title: string;
	code?: string;
	note?: string;
};

export type Strings = {
	meta: {
		title: string;
		description: string;
	};
	nav: {
		features: string;
		screenshots: string;
		install: string;
		github: string;
	};
	hero: {
		tagline: string;
		versionLabel: string;
		ctaDocker: string;
		ctaDesktop: string;
		ctaGithub: string;
		desktopExperimental: string;
	};
	sections: {
		featuresTitle: string;
		screenshotsTitle: string;
		installTitle: string;
	};
	features: Feature[];
	screenshots: Screenshot[];
	install: {
		primaryTitle: string;
		primaryBadge: string;
		primaryLead: string;
		primaryNote: string;
		primarySteps: InstallStep[];
		primaryDocsLink: string;
		secondaryTitle: string;
		secondaryLead: string;
		secondaryDownload: string;
		secondaryNote: string;
		secondarySteps: InstallStep[];
	};
	footer: {
		license: string;
		viewOnGithub: string;
	};
};

const screenshotFiles = [
	"queue.gif",
	"browser.gif",
	"search.gif",
	"explore.gif",
	"similarity.gif",
	"text_to_music.gif",
] as const;

const advancedNoteEn =
	"Requires additional setup via lainbow integration, an NVIDIA GPU for practical performance, and some engineering skill.";
const advancedNoteJa =
	"lainbow 連携による追加セットアップ、実用的な速度を得るための NVIDIA GPU、そしてある程度のエンジニアリングスキルが必要です。";

const screenshots: Screenshot[] = [
	{ src: screenshotFiles[0], caption: "Intuitive control" },
	{ src: screenshotFiles[1], caption: "Flexible browsing" },
	{ src: screenshotFiles[2], caption: "Advanced search" },
	{ src: screenshotFiles[3], caption: "File explorer" },
	{
		src: screenshotFiles[4],
		caption: "Similarity search",
		note: advancedNoteEn,
	},
	{
		src: screenshotFiles[5],
		caption: "Text-to-Music search",
		note: advancedNoteEn,
	},
];

const screenshotsJa: Screenshot[] = [
	{ src: screenshotFiles[0], caption: "直感的な操作" },
	{ src: screenshotFiles[1], caption: "柔軟なブラウジング" },
	{ src: screenshotFiles[2], caption: "アドバンスド検索" },
	{ src: screenshotFiles[3], caption: "ファイルエクスプローラ" },
	{
		src: screenshotFiles[4],
		caption: "類似検索",
		note: advancedNoteJa,
	},
	{
		src: screenshotFiles[5],
		caption: "テキストからの楽曲検索",
		note: advancedNoteJa,
	},
];

export const strings: Record<Locale, Strings> = {
	en: {
		meta: {
			title: "Sola MPD — A usable MPD client for large libraries",
			description:
				"Sola MPD is an MPD client focused on usability, with flexible browsing and search. Deploy with Docker, or try the experimental desktop build.",
		},
		nav: {
			features: "Features",
			screenshots: "Screenshots",
			install: "Install",
			github: "GitHub",
		},
		hero: {
			tagline:
				"An MPD client focused on usability — flexible browsing, powerful search, and effortless queue management for libraries of any size.",
			versionLabel: "Latest release",
			ctaDocker: "Deploy with Docker",
			ctaDesktop: "Download Desktop",
			ctaGithub: "View on GitHub",
			desktopExperimental: "Experimental",
		},
		sections: {
			featuresTitle: "Features",
			screenshotsTitle: "Screenshots",
			installTitle: "Install",
		},
		features: [
			{
				title: "Flexible search",
				description:
					"Combine equals, not-equals, contains, and regex conditions with AND/OR. Save searches as smart playlists, inspired by MusicBee.",
			},
			{
				title: "Metadata browser",
				description:
					"Navigate by artist, album, genre and more — inspired by GMPC. A quick filter box narrows results on the fly.",
			},
			{
				title: "Spreadsheet-like song table",
				description:
					"Powered by AG Grid. Reorder and resize columns by drag & drop, sort by any column, and range-select with Shift or multi-select with Ctrl.",
			},
			{
				title: "Plugin system",
				description:
					"Integrate with external services through plugins. A Subsonic plugin is bundled to sync playlists with any Subsonic-compatible server.",
			},
			{
				title: "Advanced search (Beta)",
				description:
					"Text-to-Music and similarity search powered by MuQ / MuQ-MuLan via lainbow. Additional setup, an NVIDIA GPU, and some engineering skill are required.",
			},
			{
				title: "Multiple MPD servers",
				description:
					"Register and switch between multiple MPD servers from a single client — ideal for managing different libraries or rooms.",
			},
			{
				title: "Queue & playlists",
				description:
					"Build and rearrange the play queue. Manage MPD playlists with full keyboard and context-menu support.",
			},
			{
				title: "Responsive & dark theme",
				description:
					"Tablet and mobile layouts with touch gestures. Built-in dark theme.",
			},
		],
		screenshots,
		install: {
			primaryTitle: "Web application (Docker)",
			primaryBadge: "Recommended",
			primaryLead:
				"Deploy Sola MPD on any server in your local network that can reach your MPD server. Requires MPD 0.21 or later, plus Docker and Docker Compose on the host.",
			primaryNote:
				"If MPD runs on the same host as Docker (default bridge network), use host.docker.internal instead of localhost when entering the MPD endpoint.",
			primarySteps: [
				{
					title: "Ensure Docker is running on the server",
					code: "docker ps",
				},
				{
					title:
						"Clone the repository and check out the latest release tag (the main branch may contain unreleased changes)",
					code: "git clone https://github.com/prokosna/sola_mpd.git\ncd sola_mpd\ngit checkout $(git tag --sort=-v:refname | head -n 1)",
				},
				{
					title:
						"(Optional) edit docker-compose.yaml to change the port or other settings",
				},
				{
					title: "Start the application",
					code: "docker compose up -d",
				},
				{
					title:
						"Open http://[your-server-ip]:3000 (the default port) in your browser and enter your MPD endpoint in the setup dialog",
				},
			],
			primaryDocsLink: "Full setup instructions in README",
			secondaryTitle: "Desktop application",
			secondaryLead:
				"Pre-built installers for Windows, macOS and Linux are available on the Releases page.",
			secondaryDownload: "Go to Releases",
			secondaryNote:
				"The desktop build is experimental and may have limitations compared to the web application. The Docker web app remains the primary, recommended distribution.",
			secondarySteps: [
				{
					title:
						"Download the installer for your platform from the latest release",
				},
				{ title: "Install and launch the application" },
				{
					title: "Enter the endpoint of your MPD server in the setup dialog",
				},
			],
		},
		footer: {
			license: "Released under the MIT License.",
			viewOnGithub: "Source on GitHub",
		},
	},
	ja: {
		meta: {
			title: "Sola MPD — 大規模ライブラリのための使いやすい MPD クライアント",
			description:
				"Sola MPD は使いやすさを重視した MPD クライアントです。柔軟なブラウジングと検索を備え、Docker でデプロイできます。実験的にデスクトップビルドも提供しています。",
		},
		nav: {
			features: "機能",
			screenshots: "スクリーンショット",
			install: "インストール",
			github: "GitHub",
		},
		hero: {
			tagline:
				"使いやすさを重視した MPD クライアント。大規模ライブラリでも柔軟なブラウジング、強力な検索、スムーズなキュー操作を実現します。",
			versionLabel: "最新リリース",
			ctaDocker: "Docker でデプロイ",
			ctaDesktop: "デスクトップをダウンロード",
			ctaGithub: "GitHub を見る",
			desktopExperimental: "実験的",
		},
		sections: {
			featuresTitle: "機能",
			screenshotsTitle: "スクリーンショット",
			installTitle: "インストール",
		},
		features: [
			{
				title: "柔軟な検索",
				description:
					"=、!=、has、正規表現を AND/OR で自由に組み合わせ。MusicBee にインスパイアされたスマートプレイリストとして保存も可能です。",
			},
			{
				title: "メタデータブラウザ",
				description:
					"アーティスト・アルバム・ジャンルなどで階層的にナビゲート (GMPC にインスパイア)。クイックフィルタで結果をその場で絞り込めます。",
			},
			{
				title: "スプレッドシート風の楽曲テーブル",
				description:
					"AG Grid による高機能テーブル。ドラッグ & ドロップでの列の並び替えとリサイズ、任意の列でのソート、Shift / Ctrl による範囲・複数選択に対応。",
			},
			{
				title: "プラグインシステム",
				description:
					"プラグイン経由で外部サービスと連携可能。同梱の Subsonic プラグインで、Subsonic 互換サーバーとプレイリストを同期できます。",
			},
			{
				title: "アドバンスド検索 (Beta)",
				description:
					"lainbow 連携により、MuQ / MuQ-MuLan を用いたテキストからの楽曲検索と類似検索が可能です。追加セットアップ、NVIDIA GPU、ある程度のエンジニアリングスキルが必要です。",
			},
			{
				title: "複数 MPD サーバー対応",
				description:
					"ひとつのクライアントから複数の MPD サーバーを登録・切り替え。ライブラリを分けて管理したい場合や部屋ごとの運用に便利です。",
			},
			{
				title: "キュー & プレイリスト",
				description:
					"再生キューを自在に組み立て、MPD プレイリストをキーボードとコンテキストメニューで直感的に管理できます。",
			},
			{
				title: "レスポンシブ & ダークテーマ",
				description:
					"タブレット・モバイル向けのレイアウトとタッチ操作に対応。ダークテーマを標準搭載しています。",
			},
		],
		screenshots: screenshotsJa,
		install: {
			primaryTitle: "Web アプリケーション (Docker)",
			primaryBadge: "推奨",
			primaryLead:
				"MPD サーバーにアクセスできるローカルネットワーク上の任意のサーバーにデプロイします。MPD 0.21 以降と、ホスト側の Docker / Docker Compose が必要です。",
			primaryNote:
				"MPD を Docker と同一ホスト (デフォルトの bridge ネットワーク) で動かしている場合、セットアップダイアログでは localhost の代わりに host.docker.internal を指定してください。",
			primarySteps: [
				{
					title: "サーバー上で Docker が起動していることを確認",
					code: "docker ps",
				},
				{
					title:
						"リポジトリをクローンし、最新のリリースタグをチェックアウト (main ブランチには未リリースの変更が含まれる場合があります)",
					code: "git clone https://github.com/prokosna/sola_mpd.git\ncd sola_mpd\ngit checkout $(git tag --sort=-v:refname | head -n 1)",
				},
				{
					title:
						" (任意) ポートや設定を変更したい場合は docker-compose.yaml を編集",
				},
				{
					title: "アプリケーションを起動",
					code: "docker compose up -d",
				},
				{
					title:
						"ブラウザで http://[サーバーの IP]:3000 (デフォルトポート) を開き、セットアップダイアログで MPD エンドポイントを入力",
				},
			],
			primaryDocsLink: "README の詳細なセットアップ手順",
			secondaryTitle: "デスクトップアプリケーション",
			secondaryLead:
				"Windows / macOS / Linux 向けのビルド済みインストーラーを Releases ページで配布しています。",
			secondaryDownload: "Releases を開く",
			secondaryNote:
				"デスクトップ版は実験的な提供であり、Web アプリに比べて機能に制限がある場合があります。メインかつ推奨の配布形態は Docker 版 Web アプリです。",
			secondarySteps: [
				{
					title:
						"最新リリースから使用中のプラットフォーム向けインストーラーをダウンロード",
				},
				{ title: "インストールしてアプリケーションを起動" },
				{
					title: "セットアップダイアログで MPD サーバーのエンドポイントを入力",
				},
			],
		},
		footer: {
			license: "MIT ライセンスの下で公開されています。",
			viewOnGithub: "GitHub でソースを見る",
		},
	},
};
