import React, { createContext, useState, useContext, useEffect } from 'react';
import { AVAILABLE_LANGUAGES, loadLanguage, preloadLanguages } from './LanguageLoader';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export available languages from the loader
export { AVAILABLE_LANGUAGES };

// Dynamic translations - loaded on demand
let translationsCache = {
  en: {
    // Header
    home: 'Home',
    generator: 'Generator',
    languageSelector: 'Language',

    // Home page
    welcome: 'Welcome to TKVGen',
    subtitle: 'Transform your photos into stunning videos with custom music',
    getStarted: 'Get Started',
    createVideo: 'Create Video',

    // What is QWGenv section
    whatIsQWGenv: 'What is QWGenv?',
    qwgenvIntro: 'In today\'s fast-paced digital world, creating engaging video content <span style="color: #fbbf24; font-weight: 600;">quickly</span> has become essential for personal memories, social media, marketing campaigns, and professional presentations. QWGenv addresses this need by providing an <span style="color: #f97316; font-weight: 600;">incredibly fast</span> and <span style="color: #fbbf24; font-weight: 600;">efficient solution</span> that transforms your static photos into dynamic, professional-quality videos <span style="color: #f97316; font-weight: 600;">within seconds</span>. Our platform specializes in <span style="color: #fbbf24; font-weight: 600;">rapid video generation</span>, making <span style="color: #f97316; font-weight: 600;">speed our top priority</span>. With our streamlined process, what traditionally takes hours of video editing can now be accomplished in <span style="color: #f97316; font-weight: 600;">under a minute</span>. Simply upload your photos, choose your music, and watch as our advanced processing engine creates your video <span style="color: #fbbf24; font-weight: 600;">almost instantly</span>. No technical skills required, no lengthy rendering times - just <span style="color: #f97316; font-weight: 600;">quick way, beautiful results</span> that you can download and share <span style="color: #fbbf24; font-weight: 600;">immediately</span>.',
    readyToStart: 'Ready to create your first video?',
    tryItNow: 'Try it now',
    andSeeTheMagic: 'and see the magic happen!',

    // Upload Photos
    uploadPhotos: 'Upload Photos',
    uploadVideos: 'Upload Videos',
    photos: 'Photos',
    videos: 'Videos',
    clickToUpload: 'Click to upload photos or drag and drop',
    clickToUploadVideos: 'Click to upload videos or drag and drop',
    photoFormats: 'PNG, JPG, GIF up to 10MB',
    videoFormats: 'MP4, MOV, WebM up to 10MB',
    uploadingPhotos: 'Uploading photos...',
    mediaGallery: 'Media Gallery',
    photoUploaded: 'photo uploaded',
    photosUploaded: 'photos uploaded',
    videoUploaded: 'video uploaded',
    videosUploaded: 'videos uploaded',
    clearAll: 'Clear All',
    removePhoto: 'Remove photo',
    photoModeSelected: 'Photo mode selected. Please upload image files only or switch to Video mode.',
    videoModeSelected: 'Video mode selected. Please upload video files only or switch to Photo mode.',
    noValidImages: 'No valid image files found.',
    noValidVideos: 'No valid video files found.',
    pleaseDropImages: 'Please drop image files only',
    pleaseDropVideos: 'Please drop video files only',

    // Music Selector
    musicLibrary: 'Music Library',
    uploadMusic: 'Upload Music',
    uploadYourMusic: 'Upload Your Own Music',
    uploadDifferentMusic: 'Upload Different Music',
    audioFormats: 'Supports MP3, WAV, OGG, M4A, and AAC formats • Max 10MB',
    uploadingTrack: 'Uploading your track...',
    musicSelected: 'Music selected for video - Click to deselect',
    selectMusic: 'Select this music for video',
    scanToAccess: 'Scan with your phone to access the video',
    remove: 'Remove',

    // Video Export
    generateVideo: 'Generate Video',
    generatingVideo: 'Generating Video...',
    videoGenerated: 'Video Generated Successfully!',
    slideshowReady: 'Slideshow Ready',
    videoPreview: 'Video Preview',
    downloadVideo: 'Download Video',
    createNewVideo: 'New Video',

    // Progress messages
    startingGeneration: 'Starting video generation...',
    creatingClips: 'Creating video clips...',
    processingPhoto: 'Processing your photo...',
    combiningMusic: 'Combining with music...',
    finishingTouches: 'Finishing touches...',

    // Status messages
    pleaseFillRequirements: 'Please upload photos and select music before generating a video.',
    videoReady: 'Your video is ready for preview and download.',
    photoDisplayed: 'Your photo will be displayed for',
    photosDisplayed: 'Your photos will be displayed sequentially',
    secondsEach: 'seconds each',
    withMusic: 'with your music.',
    music: 'Music',
    duration: 'Duration',
    resolution: 'Resolution',
    fileSize: 'File',

    // Error messages
    error: 'Error',
    uploadFailed: 'Failed to upload media',
    noFileSelected: 'No file selected',
    generationFailed: 'Video generation failed',
    downloadFailed: 'Download failed',

    // Dialog buttons
    cancel: 'Cancel',
    confirm: 'Confirm',

    // QR Code
    mobileQRCode: 'Mobile QR Code',
    qrCodeForVideo: 'QR Code for video',
    expires: 'Expires',

    // Mobile instructions
    mobileUsers: 'Mobile Users',
    iosInstructions: 'iOS: Tap button → Long press video → "Save to Photos"',
    androidInstructions: 'Android: Tap button → Downloads folder or "Save video"',
    chromeInstructions: 'Chrome: Tap button → Check Downloads notification',

    // File info
    filename: 'Filename',
    processing: 'Processing',
    completed: 'Completed',
    ready: 'Ready',
    seconds: 'seconds',

    // Language dialog
    chooseLanguage: 'Choose Your Language',
    selectPreferredLanguage: 'Select your preferred language',
    searchLanguage: 'Search for a language...',
    close: 'Close',

    // Home page content
    guideStepsTitle: 'Guide Steps with Photos',
    guideStepsDescription: 'Creating amazing videos with QWGenv is as simple as three easy steps. Follow our streamlined process to transform your photos into captivating videos in minutes.',
    stepUploadMedia: 'Upload Media',
    stepSelectMusic: 'Select Music',
    stepGenerateVideo: 'Generate Video',
    stepUploadDescription: 'Drag and drop your photos or videos',
    stepMusicDescription: 'Choose from our library or upload your own',
    stepVideoDescription: 'Click generate and download your video',

    // Comments section
    userComments: 'User Comments',
    submitComment: 'Submit Comment',
    shareExperience: 'Share your experience with QWGenv...',
    yourName: 'Your Name',

    // Sample comments
    sampleComment1: 'Amazing tool! Created a beautiful video in minutes.',
    sampleComment2: 'Super easy to use, love the music selection.',
    sampleComment3: 'Perfect for my social media content creation!',
    timeAgo2Hours: '2 hours ago',
    timeAgo5Hours: '5 hours ago',
    timeAgo1Day: '1 day ago',
    justNow: 'Just now',

    // Footer
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    allRightsReserved: 'All rights reserved',

    // Modal content
    aboutContent: 'QWGenv is a cutting-edge video creation platform designed to make professional-quality videos accessible to everyone. Our mission is to democratize video creation through innovative technology and user-friendly design.',
    getInTouch: 'Get in touch with our team:',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    yourEmail: 'Your Email',
    yourMessage: 'Your Message',
    sendMessage: 'Send Message',
    privacyContent: 'We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use QWGenv. We only collect necessary data to provide our services and never share your personal information with third parties without your consent.',
    termsContent: 'By using QWGenv, you agree to these terms of service. You may use our platform for personal and commercial video creation. You retain ownership of your uploaded content. We reserve the right to terminate accounts that violate our community guidelines or engage in harmful activities.',

    // Additional UI text
    yourBrowserDoesNotSupport: 'Your browser does not support the video tag',
    chooseFile: 'Choose file',
    noFileChosen: 'No file chosen',
    yourVideoIsReady: 'Your video is ready!',
    yourPhotoWillBeDisplayed: 'Your photo will be displayed for',
    yourPhotosWillBeDisplayed: 'Your photos will be displayed sequentially',
    secondsWithMusic: 'seconds with music',
    videoGeneratedSuccessfully: 'Video Generated Successfully!',
    videoPreviewTitle: 'Video Preview',
    startingVideoGeneration: 'Starting video generation...',
    creatingVideoClips: 'Creating video clips...',
    processingYourPhoto: 'Processing your photo...',
    combiningWithMusic: 'Combining with music...',
    unableToLoadVideo: 'Unable to load video preview. The file may still be processing.',
    scanWithPhone: 'Scan with your phone to access the video',
    videoWillBeGenerated: 'Video will be generated in MP4 format (H.264/AAC)',
    processingMayTake: 'Processing may take a few minutes depending on the number of photos',
    eachPhotoWillBeDisplayed: 'Each photo will be displayed for',
    inTheSlideshow: 's in the slideshow',
    qrCodeAvailable: 'QR code available for mobile viewing (expires in 5 minutes)',
    hideQRSettings: 'Hide',
    configureQRSettings: 'Configure',
    qrCodeSettings: 'QR Code Settings',
    forMobileAccess: 'For mobile access, set your public URL:'
    setButton: 'Set',
    settingButton: 'Setting...',
    tipUseNgrok: '💡 Tip: Deploy your application to make it accessible to mobile devices',
    selected: 'selected',

    // Advertisement
    advertisementSpace: 'Advertisement Space',
    adSenseLeaderboard: 'Google AdSense - 728x90 Leaderboard',

    // Additional VideoExport translations
    photo: 'photo',
    photosSelected: 'photos + music selected',

    // MusicSelector additional translations
    loadingMusicLibrary: 'Loading music library...',
    noLocalMusicFound: 'No Local Music Found',
    addMusicFiles: 'Add music files to the local-music directory',

    // Coming Soon features
    comingSoon: 'Coming Soon',
    newFeaturesTitle: '🚀 New Features Coming Soon!',
    flipPhotosFeature: '🔄 Flip Photos in Video',
    flipPhotosDesc: 'Add rotation and flip effects to your photos for dynamic visual appeal',
    gridLayoutFeature: '📐 4-Grid Layout',
    gridLayoutDesc: 'Able to display 4 photos in one slideshow in video for storytelling',
    advancedTransitionsFeature: '🎨 Advanced Transitions',
    advancedTransitionsDesc: 'Smooth transitions between photos with professional effects',
    customTimingFeature: '⏱️ Custom Timing',
    customTimingDesc: 'Individual timing control for each photo in your slideshow',
    stayTuned: 'Stay tuned for updates!'
  },

  es: {
    // Header
    home: 'Inicio',
    generator: 'Generador',
    languageSelector: 'Idioma',

    // Home page
    welcome: 'Bienvenido a TKVGen',
    subtitle: 'Transforma tus fotos en videos impresionantes con música personalizada',
    getStarted: 'Comenzar',
    createVideo: 'Crear Video',

    // What is QWGenv section
    whatIsQWGenv: '¿Qué es QWGenv?',
    qwgenvIntro: 'En el mundo digital acelerado de hoy, crear contenido de video atractivo <span style="color: #fbbf24; font-weight: 600;">rápidamente</span> se ha vuelto esencial para recuerdos personales, redes sociales, campañas de marketing y presentaciones profesionales. QWGenv aborda esta necesidad proporcionando una solución <span style="color: #f97316; font-weight: 600;">increíblemente rápida</span> y <span style="color: #fbbf24; font-weight: 600;">eficiente</span> que transforma tus fotos estáticas en videos dinámicos y de calidad profesional <span style="color: #f97316; font-weight: 600;">en segundos</span>. Nuestra plataforma se especializa en <span style="color: #fbbf24; font-weight: 600;">generación rápida de videos</span>, haciendo de <span style="color: #f97316; font-weight: 600;">la velocidad nuestra máxima prioridad</span>. Con nuestro proceso simplificado, lo que tradicionalmente toma horas de edición de video ahora se puede lograr en <span style="color: #f97316; font-weight: 600;">menos de un minuto</span>. Simplemente sube tus fotos, elige tu música, y observa cómo nuestro motor de procesamiento avanzado crea tu video <span style="color: #fbbf24; font-weight: 600;">casi instantáneamente</span>. No se requieren habilidades técnicas, no hay tiempos de renderizado largos - solo <span style="color: #f97316; font-weight: 600;">resultados rápidos y hermosos</span> que puedes descargar y compartir <span style="color: #fbbf24; font-weight: 600;">inmediatamente</span>.',
    readyToStart: '¿Listo para crear tu primer video?',
    tryItNow: 'Pruébalo ahora',
    andSeeTheMagic: 'y ve la magia suceder!',

    // Upload Photos
    uploadPhotos: 'Subir Fotos',
    uploadVideos: 'Subir Videos',
    photos: 'Fotos',
    videos: 'Videos',
    clickToUpload: 'Haz clic para subir fotos o arrastra y suelta',
    clickToUploadVideos: 'Haz clic para subir videos o arrastra y suelta',
    photoFormats: 'PNG, JPG, GIF hasta 10MB',
    videoFormats: 'MP4, MOV, WebM hasta 10MB',
    uploadingPhotos: 'Subiendo fotos...',
    mediaGallery: 'Galería Multimedia',
    photoUploaded: 'foto subida',
    photosUploaded: 'fotos subidas',
    videoUploaded: 'video subido',
    videosUploaded: 'videos subidos',
    clearAll: 'Limpiar Todo',
    removePhoto: 'Eliminar foto',

    // Music Selector
    musicLibrary: 'Biblioteca Musical',
    uploadMusic: 'Subir Música',
    uploadYourMusic: 'Sube Tu Propia Música',
    uploadDifferentMusic: 'Subir Música Diferente',
    audioFormats: 'Compatible con MP3, WAV, OGG, M4A y AAC • Máx 10MB',
    uploadingTrack: 'Subiendo tu pista...',
    musicSelected: 'Música seleccionada para video - Haz clic para deseleccionar',
    selectMusic: 'Seleccionar esta música para video',
    scanToAccess: 'Escanea con tu teléfono para acceder al video',
    remove: 'Eliminar',

    // Video Export
    generateVideo: 'Generar Video',
    generatingVideo: 'Generando Video...',
    videoGenerated: '¡Video Generado Exitosamente!',
    slideshowReady: 'Presentación Lista',
    videoPreview: 'Vista Previa del Video',
    downloadVideo: 'Descargar Video',
    createNewVideo: 'Crear Nuevo Video',

    // Language dialog
    chooseLanguage: 'Elige Tu Idioma',
    selectPreferredLanguage: 'Selecciona tu idioma preferido',
    searchLanguage: 'Buscar un idioma...',
    close: 'Cerrar',

    // Home page content
    guideStepsTitle: 'Pasos de la Guía con Fotos',
    guideStepsDescription: 'Crear videos increíbles con QWGenv es tan simple como tres pasos fáciles. Sigue nuestro proceso optimizado para transformar tus fotos en videos cautivadores en minutos.',
    stepUploadMedia: 'Subir Medios',
    stepSelectMusic: 'Seleccionar Música',
    stepGenerateVideo: 'Generar Video',
    stepUploadDescription: 'Arrastra y suelta tus fotos o videos',
    stepMusicDescription: 'Elige de nuestra biblioteca o sube la tuya',
    stepVideoDescription: 'Haz clic en generar y descarga tu video',

    // Comments section
    userComments: 'Comentarios de Usuarios',
    submitComment: 'Enviar Comentario',
    shareExperience: 'Comparte tu experiencia con QWGenv...',
    yourName: 'Tu Nombre',

    // Sample comments
    sampleComment1: '¡Herramienta increíble! Creé un video hermoso en minutos.',
    sampleComment2: 'Súper fácil de usar, me encanta la selección de música.',
    sampleComment3: '¡Perfecto para la creación de contenido de mis redes sociales!',
    timeAgo2Hours: 'hace 2 horas',
    timeAgo5Hours: 'hace 5 horas',
    timeAgo1Day: 'hace 1 día',
    justNow: 'ahora mismo',

    // Footer
    aboutUs: 'Sobre Nosotros',
    contactUs: 'Contáctanos',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    allRightsReserved: 'Todos los derechos reservados',

    // Modal content
    aboutContent: 'QWGenv es una plataforma de creación de videos de vanguardia diseñada para hacer videos de calidad profesional accesibles para todos. Nuestra misión es democratizar la creación de videos a través de tecnología innovadora y diseño fácil de usar.',
    getInTouch: 'Ponte en contacto con nuestro equipo:',
    email: 'Correo',
    phone: 'Teléfono',
    address: 'Dirección',
    yourEmail: 'Tu Correo',
    yourMessage: 'Tu Mensaje',
    sendMessage: 'Enviar Mensaje',
    privacyContent: 'Respetamos tu privacidad y estamos comprometidos a proteger tus datos personales. Esta política de privacidad explica cómo recopilamos, usamos y protegemos tu información cuando usas QWGenv. Solo recopilamos los datos necesarios para brindar nuestros servicios y nunca compartimos tu información personal con terceros sin tu consentimiento.',
    termsContent: 'Al usar QWGenv, aceptas estos términos de servicio. Puedes usar nuestra plataforma para la creación de videos personales y comerciales. Mantienes la propiedad de tu contenido subido. Nos reservamos el derecho de terminar cuentas que violen nuestras pautas comunitarias o se involucren en actividades dañinas.',

    // Additional UI text
    music: 'Música',
    duration: 'Duración',
    resolution: 'Resolución',
    expires: 'Expira',
    yourBrowserDoesNotSupport: 'Tu navegador no soporta la etiqueta de video',
    chooseFile: 'Elegir archivo',
    noFileChosen: 'Ningún archivo elegido',
    mobileQRCode: 'Código QR Móvil',
    qrCodeForVideo: 'Código QR para Video',
    yourVideoIsReady: '¡Tu video está listo!',
    yourPhotoWillBeDisplayed: 'Tu foto será mostrada por',
    yourPhotosWillBeDisplayed: 'Tus fotos serán mostradas secuencialmente',
    secondsWithMusic: 'segundos con música',
    secondsEach: 'segundos cada una',
    withMusic: 'con música',

    // Advertisement
    advertisementSpace: 'Espacio Publicitario',
    adSenseLeaderboard: 'Google AdSense - Banner 728x90',

    // Additional VideoExport translations
    videoGeneratedSuccessfully: '¡Video Generado Exitosamente!',
    videoPreviewTitle: 'Vista Previa del Video',
    startingVideoGeneration: 'Iniciando generación de video...',
    creatingVideoClips: 'Creando clips de video...',
    processingYourPhoto: 'Procesando tu foto...',
    combiningWithMusic: 'Combinando con música...',
    finishingTouches: 'Toques finales...',
    unableToLoadVideo: 'No se puede cargar la vista previa del video. El archivo puede estar aún procesándose.',
    scanWithPhone: 'Escanea con tu teléfono para acceder al video',
    videoWillBeGenerated: 'El video se generará en formato MP4 (H.264/AAC)',
    processingMayTake: 'El procesamiento puede tomar unos minutos dependiendo del número de fotos',
    ready: 'Listo',
    photo: 'foto',
    photosSelected: 'fotos + música seleccionadas',
    eachPhotoWillBeDisplayed: 'Cada foto se mostrará durante',
    inTheSlideshow: 's en la presentación',
    qrCodeAvailable: 'Código QR disponible para visualización móvil (expira en 5 minutos)',
    hideQRSettings: 'Ocultar',
    configureQRSettings: 'Configurar',
    qrCodeSettings: 'Configuración de Código QR',
    forMobileAccess: 'Para acceso móvil, establece tu URL pública:'
    setButton: 'Establecer',
    settingButton: 'Estableciendo...',
    tipUseNgrok: '💡 Consejo: Despliega tu aplicación para hacerla accesible a dispositivos móviles',
    selected: 'seleccionada',

    // Error messages
    error: 'Error',
    uploadFailed: 'Error al subir multimedia',
    noFileSelected: 'Ningún archivo seleccionado',
    generationFailed: 'Error en la generación de video',
    downloadFailed: 'Error en la descarga',

    // Dialog buttons
    cancel: 'Cancelar',
    confirm: 'Confirmar',

    // MusicSelector additional translations
    loadingMusicLibrary: 'Cargando biblioteca musical...',
    noLocalMusicFound: 'No se Encontró Música Local',
    addMusicFiles: 'Agrega archivos de música al directorio local-music'
  },

  pt: {
    // Header
    home: 'Início',
    generator: 'Gerador',
    languageSelector: 'Idioma',

    // Home page
    welcome: 'Bem-vindo ao TKVGen',
    subtitle: 'Transforme suas fotos em vídeos impressionantes com música personalizada',
    getStarted: 'Começar',
    createVideo: 'Criar Vídeo',

    // What is QWGenv section
    whatIsQWGenv: 'O que é QWGenv?',
    qwgenvIntro: 'No mundo digital acelerado de hoje, criar conteúdo de vídeo envolvente <span style="color: #fbbf24; font-weight: 600;">rapidamente</span> tornou-se essencial para memórias pessoais, redes sociais, campanhas de marketing e apresentações profissionais. QWGenv atende essa necessidade fornecendo uma solução <span style="color: #f97316; font-weight: 600;">incrivelmente rápida</span> e <span style="color: #fbbf24; font-weight: 600;">eficiente</span> que transforma suas fotos estáticas em vídeos dinâmicos e de qualidade profissional <span style="color: #f97316; font-weight: 600;">em segundos</span>. Nossa plataforma especializa-se em <span style="color: #fbbf24; font-weight: 600;">geração rápida de vídeos</span>, fazendo da <span style="color: #f97316; font-weight: 600;">velocidade nossa principal prioridade</span>. Com nosso processo simplificado, o que tradicionalmente leva horas de edição de vídeo agora pode ser realizado em <span style="color: #f97316; font-weight: 600;">menos de um minuto</span>. Simplesmente carregue suas fotos, escolha sua música, e observe nosso mecanismo de processamento avançado criar seu vídeo <span style="color: #fbbf24; font-weight: 600;">quase instantaneamente</span>. Não são necessárias habilidades técnicas, não há tempos longos de renderização - apenas <span style="color: #f97316; font-weight: 600;">resultados rápidos e belos</span> que você pode baixar e compartilhar <span style="color: #fbbf24; font-weight: 600;">imediatamente</span>.',
    readyToStart: 'Pronto para criar seu primeiro vídeo?',
    tryItNow: 'Experimente agora',
    andSeeTheMagic: 'e veja a mágica acontecer!',

    // Upload Photos
    uploadPhotos: 'Enviar Fotos',
    uploadVideos: 'Enviar Vídeos',
    photos: 'Fotos',
    videos: 'Vídeos',
    clickToUpload: 'Clique para enviar fotos ou arraste e solte',
    clickToUploadVideos: 'Clique para enviar vídeos ou arraste e solte',
    photoFormats: 'PNG, JPG, GIF até 10MB',
    videoFormats: 'MP4, MOV, WebM até 10MB',
    uploadingPhotos: 'Enviando fotos...',
    mediaGallery: 'Galeria de Mídia',
    photoUploaded: 'foto enviada',
    photosUploaded: 'fotos enviadas',
    videoUploaded: 'vídeo enviado',
    videosUploaded: 'vídeos enviados',
    clearAll: 'Limpar Tudo',
    removePhoto: 'Remover foto',

    // Music Selector
    musicLibrary: 'Biblioteca Musical',
    uploadMusic: 'Enviar Música',
    uploadYourMusic: 'Envie Sua Própria Música',
    uploadDifferentMusic: 'Enviar Música Diferente',
    audioFormats: 'Suporta MP3, WAV, OGG, M4A e AAC • Máx 10MB',
    uploadingTrack: 'Enviando sua faixa...',
    musicSelected: 'Música selecionada para vídeo - Clique para desselecionar',
    selectMusic: 'Selecionar esta música para vídeo',
    scanToAccess: 'Escaneie com seu telefone para acessar o vídeo',
    remove: 'Remover',

    // Video Export
    generateVideo: 'Gerar Vídeo',
    generatingVideo: 'Gerando Vídeo...',
    videoGenerated: 'Vídeo Gerado com Sucesso!',
    slideshowReady: 'Slideshow Pronto',
    videoPreview: 'Pré-visualização do Vídeo',
    downloadVideo: 'Baixar Vídeo',
    createNewVideo: 'Criar Novo Vídeo',

    // Language dialog
    chooseLanguage: 'Escolha Seu Idioma',
    selectPreferredLanguage: 'Selecione seu idioma preferido',
    searchLanguage: 'Pesquisar um idioma...',
    close: 'Fechar',

    // Home page content
    guideStepsTitle: 'Passos do Guia com Fotos',
    guideStepsDescription: 'Criar vídeos incríveis com QWGenv é tão simples quanto três passos fáceis. Siga nosso processo otimizado para transformar suas fotos em vídeos cativantes em minutos.',
    stepUploadMedia: 'Enviar Mídia',
    stepSelectMusic: 'Selecionar Música',
    stepGenerateVideo: 'Gerar Vídeo',
    stepUploadDescription: 'Arraste e solte suas fotos ou vídeos',
    stepMusicDescription: 'Escolha de nossa biblioteca ou envie a sua',
    stepVideoDescription: 'Clique em gerar e baixe seu vídeo',

    // Comments section
    userComments: 'Comentários dos Usuários',
    submitComment: 'Enviar Comentário',
    shareExperience: 'Compartilhe sua experiência com QWGenv...',
    yourName: 'Seu Nome',

    // Sample comments
    sampleComment1: 'Ferramenta incrível! Criei um vídeo lindo em minutos.',
    sampleComment2: 'Super fácil de usar, adoro a seleção de música.',
    sampleComment3: 'Perfeito para a criação de conteúdo das minhas redes sociais!',
    timeAgo2Hours: 'há 2 horas',
    timeAgo5Hours: 'há 5 horas',
    timeAgo1Day: 'há 1 dia',
    justNow: 'agora mesmo',

    // Footer
    aboutUs: 'Sobre Nós',
    contactUs: 'Entre em Contato',
    privacyPolicy: 'Política de Privacidade',
    termsOfService: 'Termos de Serviço',
    allRightsReserved: 'Todos os direitos reservados',

    // Modal content
    aboutContent: 'QWGenv é uma plataforma de criação de vídeos de ponta projetada para tornar vídeos de qualidade profissional acessíveis a todos. Nossa missão é democratizar a criação de vídeos através de tecnologia inovadora e design fácil de usar.',
    getInTouch: 'Entre em contato com nossa equipe:',
    email: 'Email',
    phone: 'Telefone',
    address: 'Endereço',
    yourEmail: 'Seu Email',
    yourMessage: 'Sua Mensagem',
    sendMessage: 'Enviar Mensagem',
    privacyContent: 'Respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais. Esta política de privacidade explica como coletamos, usamos e protegemos suas informações quando você usa o QWGenv. Coletamos apenas os dados necessários para fornecer nossos serviços e nunca compartilhamos suas informações pessoais com terceiros sem seu consentimento.',
    termsContent: 'Ao usar o QWGenv, você concorda com estes termos de serviço. Você pode usar nossa plataforma para criação de vídeos pessoais e comerciais. Você mantém a propriedade do seu conteúdo enviado. Reservamos o direito de encerrar contas que violem nossas diretrizes da comunidade ou se envolvam em atividades prejudiciais.',

    // Additional UI text
    music: 'Música',
    duration: 'Duração',
    resolution: 'Resolução',
    expires: 'Expira',
    yourBrowserDoesNotSupport: 'Seu navegador não suporta a tag de vídeo',
    chooseFile: 'Escolher arquivo',
    noFileChosen: 'Nenhum arquivo escolhido',
    mobileQRCode: 'Código QR Móvel',
    qrCodeForVideo: 'Código QR para Vídeo',
    yourVideoIsReady: 'Seu vídeo está pronto!',
    yourPhotoWillBeDisplayed: 'Sua foto será exibida por',
    yourPhotosWillBeDisplayed: 'Suas fotos serão exibidas sequencialmente',
    secondsWithMusic: 'segundos com música',
    secondsEach: 'segundos cada',
    withMusic: 'com música',

    // Advertisement
    advertisementSpace: 'Espaço Publicitário',
    adSenseLeaderboard: 'Google AdSense - Banner 728x90',

    // Additional VideoExport translations
    videoGeneratedSuccessfully: 'Vídeo Gerado com Sucesso!',
    videoPreviewTitle: 'Pré-visualização do Vídeo',
    startingVideoGeneration: 'Iniciando geração de vídeo...',
    creatingVideoClips: 'Criando clipes de vídeo...',
    processingYourPhoto: 'Processando sua foto...',
    combiningWithMusic: 'Combinando com música...',
    finishingTouches: 'Toques finais...',
    unableToLoadVideo: 'Não é possível carregar a pré-visualização do vídeo. O arquivo pode ainda estar sendo processado.',
    scanWithPhone: 'Escaneie com seu telefone para acessar o vídeo',
    videoWillBeGenerated: 'O vídeo será gerado em formato MP4 (H.264/AAC)',
    processingMayTake: 'O processamento pode levar alguns minutos dependendo do número de fotos',
    ready: 'Pronto',
    photo: 'foto',
    photosSelected: 'fotos + música selecionadas',
    eachPhotoWillBeDisplayed: 'Cada foto será exibida por',
    inTheSlideshow: 's no slideshow',
    qrCodeAvailable: 'Código QR disponível para visualização móvel (expira em 5 minutos)',
    hideQRSettings: 'Ocultar',
    configureQRSettings: 'Configurar',
    qrCodeSettings: 'Configurações do Código QR',
    forMobileAccess: 'Para acesso móvel, defina sua URL pública:'
    setButton: 'Definir',
    settingButton: 'Definindo...',
    tipUseNgrok: '💡 Dica: Faça deploy da sua aplicação para torná-la acessível a dispositivos móveis',
    selected: 'selecionada',

    // MusicSelector additional translations
    loadingMusicLibrary: 'Carregando biblioteca musical...',
    noLocalMusicFound: 'Nenhuma Música Local Encontrada',
    addMusicFiles: 'Adicione arquivos de música ao diretório local-music'
  },

  fr: {
    // Header
    home: 'Accueil',
    generator: 'Générateur',
    languageSelector: 'Langue',

    // Home page
    welcome: 'Bienvenue sur TKVGen',
    subtitle: 'Transformez vos photos en vidéos époustouflantes avec de la musique personnalisée',
    getStarted: 'Commencer',
    createVideo: 'Créer une Vidéo',

    // What is QWGenv section
    whatIsQWGenv: 'Qu\'est-ce que QWGenv ?',
    qwgenvIntro: 'Dans le monde numérique rapide d\'aujourd\'hui, créer du contenu vidéo engageant <span style="color: #fbbf24; font-weight: 600;">rapidement</span> est devenu essentiel pour les souvenirs personnels, les réseaux sociaux, les campagnes marketing et les présentations professionnelles. QWGenv répond à ce besoin en fournissant une solution <span style="color: #f97316; font-weight: 600;">incroyablement rapide</span> et <span style="color: #fbbf24; font-weight: 600;">efficace</span> qui transforme vos photos statiques en vidéos dynamiques et de qualité professionnelle <span style="color: #f97316; font-weight: 600;">en quelques secondes</span>. Notre plateforme se spécialise dans la <span style="color: #fbbf24; font-weight: 600;">génération rapide de vidéos</span>, faisant de <span style="color: #f97316; font-weight: 600;">la vitesse notre priorité absolue</span>. Avec notre processus simplifié, ce qui prend traditionnellement des heures de montage vidéo peut maintenant être accompli en <span style="color: #f97316; font-weight: 600;">moins d\'une minute</span>. Il suffit de télécharger vos photos, choisir votre musique, et regarder notre moteur de traitement avancé créer votre vidéo <span style="color: #fbbf24; font-weight: 600;">presque instantanément</span>. Aucune compétence technique requise, aucun temps de rendu long - juste des <span style="color: #f97316; font-weight: 600;">résultats rapides et magnifiques</span> que vous pouvez télécharger et partager <span style="color: #fbbf24; font-weight: 600;">immédiatement</span>.',
    readyToStart: 'Prêt à créer votre première vidéo ?',
    tryItNow: 'Essayez maintenant',
    andSeeTheMagic: 'et voyez la magie opérer !',

    // Upload Photos
    uploadPhotos: 'Télécharger des Photos',
    uploadVideos: 'Télécharger des Vidéos',
    photos: 'Photos',
    videos: 'Vidéos',
    clickToUpload: 'Cliquez pour télécharger des photos ou glissez-déposez',
    clickToUploadVideos: 'Cliquez pour télécharger des vidéos ou glissez-déposez',
    photoFormats: 'PNG, JPG, GIF jusqu\'à 10 Mo',
    videoFormats: 'MP4, MOV, WebM jusqu\'à 10 Mo',
    uploadingPhotos: 'Téléchargement des photos...',
    mediaGallery: 'Galerie Multimédia',
    photoUploaded: 'photo téléchargée',
    photosUploaded: 'photos téléchargées',
    videoUploaded: 'vidéo téléchargée',
    videosUploaded: 'vidéos téléchargées',
    clearAll: 'Tout Effacer',
    removePhoto: 'Supprimer la photo',

    // Music Selector
    musicLibrary: 'Bibliothèque Musicale',
    uploadMusic: 'Télécharger de la Musique',
    uploadYourMusic: 'Téléchargez Votre Propre Musique',
    uploadDifferentMusic: 'Télécharger une Musique Différente',
    audioFormats: 'Prend en charge MP3, WAV, OGG, M4A et AAC • Max 10 Mo',
    uploadingTrack: 'Téléchargement de votre piste...',
    musicSelected: 'Musique sélectionnée pour la vidéo - Cliquez pour désélectionner',
    selectMusic: 'Sélectionner cette musique pour la vidéo',
    scanToAccess: 'Scannez avec votre téléphone pour accéder à la vidéo',
    remove: 'Supprimer',

    // Video Export
    generateVideo: 'Générer une Vidéo',
    generatingVideo: 'Génération de la Vidéo...',
    videoGenerated: 'Vidéo Générée avec Succès !',
    slideshowReady: 'Diaporama Prêt',
    videoPreview: 'Aperçu de la Vidéo',
    downloadVideo: 'Télécharger la Vidéo',
    createNewVideo: 'Créer une Nouvelle Vidéo',

    // Language dialog
    chooseLanguage: 'Choisissez Votre Langue',
    selectPreferredLanguage: 'Sélectionnez votre langue préférée',
    searchLanguage: 'Rechercher une langue...',
    close: 'Fermer',

    // Upload Photos

    // Music Selector

    // Video Export

    // Home page content
    guideStepsTitle: 'Étapes du Guide avec Photos',
    guideStepsDescription: 'Créer des vidéos incroyables avec QWGenv est aussi simple que trois étapes faciles. Suivez notre processus optimisé pour transformer vos photos en vidéos captivantes en quelques minutes.',
    stepUploadMedia: 'Télécharger des Médias',
    stepSelectMusic: 'Sélectionner de la Musique',
    stepGenerateVideo: 'Générer une Vidéo',
    stepUploadDescription: 'Glissez et déposez vos photos ou vidéos',
    stepMusicDescription: 'Choisissez dans notre bibliothèque ou téléchargez la vôtre',
    stepVideoDescription: 'Cliquez sur générer et téléchargez votre vidéo',

    // Comments section
    userComments: 'Commentaires des Utilisateurs',
    submitComment: 'Soumettre un Commentaire',
    shareExperience: 'Partagez votre expérience avec QWGenv...',
    yourName: 'Votre Nom',

    // Sample comments
    sampleComment1: 'Outil incroyable ! J\'ai créé une belle vidéo en quelques minutes.',
    sampleComment2: 'Super facile à utiliser, j\'adore la sélection de musique.',
    sampleComment3: 'Parfait pour la création de contenu de mes réseaux sociaux !',
    timeAgo2Hours: 'il y a 2 heures',
    timeAgo5Hours: 'il y a 5 heures',
    timeAgo1Day: 'il y a 1 jour',
    justNow: 'À l\'instant',

    // Footer
    aboutUs: 'À Propos de Nous',
    contactUs: 'Nous Contacter',
    privacyPolicy: 'Politique de Confidentialité',
    termsOfService: 'Conditions d\'Utilisation',
    allRightsReserved: 'Tous droits réservés',

    // Status messages
    pleaseFillRequirements: 'Veuillez télécharger des photos et sélectionner de la musique avant de générer une vidéo.',
    yourVideoIsReady: 'Votre vidéo est prête pour l\'aperçu et le téléchargement.',
    videoGeneratedSuccessfully: 'Vidéo Générée avec Succès !',
    videoPreviewTitle: 'Aperçu de la Vidéo',
    startingVideoGeneration: 'Démarrage de la génération vidéo...',
    creatingVideoClips: 'Création de clips vidéo...',
    processingYourPhoto: 'Traitement de votre photo...',
    combiningWithMusic: 'Combinaison avec la musique...',
    finishingTouches: 'Touches finales...',
    unableToLoadVideo: 'Impossible de charger l\'aperçu vidéo. Le fichier peut encore être en cours de traitement.',
    scanWithPhone: 'Scannez avec votre téléphone pour accéder à la vidéo',
    videoWillBeGenerated: 'La vidéo sera générée au format MP4 (H.264/AAC)',
    processingMayTake: 'Le traitement peut prendre quelques minutes selon le nombre de photos',
    ready: 'Prêt',
    photo: 'photo',
    photosSelected: 'photos + musique sélectionnées',
    mobileQRCode: 'Code QR Mobile',
    qrCodeForVideo: 'Code QR pour la vidéo',
    loadingMusicLibrary: 'Chargement de la bibliothèque musicale...',
    noLocalMusicFound: 'Aucune Musique Locale Trouvée',
    addMusicFiles: 'Ajoutez des fichiers de musique au répertoire local-music',

    // Additional UI text
    music: 'Musique',
    duration: 'Durée',
    resolution: 'Résolution',
    expires: 'Expire',
    yourBrowserDoesNotSupport: 'Votre navigateur ne prend pas en charge la balise vidéo',
    chooseFile: 'Choisir un fichier',
    noFileChosen: 'Aucun fichier choisi',
    yourPhotoWillBeDisplayed: 'Votre photo sera affichée pendant',
    yourPhotosWillBeDisplayed: 'Vos photos seront affichées séquentiellement',
    secondsWithMusic: 'secondes avec musique',
    secondsEach: 'secondes chacune',
    withMusic: 'avec musique',

    // Advertisement
    advertisementSpace: 'Espace Publicitaire',
    adSenseLeaderboard: 'Google AdSense - Bannière 728x90'
  },

  de: {
    // Header
    home: 'Startseite',
    generator: 'Generator',
    languageSelector: 'Sprache',

    // Home page
    welcome: 'Willkommen bei TKVGen',
    subtitle: 'Verwandeln Sie Ihre Fotos in atemberaubende Videos mit individueller Musik',
    getStarted: 'Loslegen',
    createVideo: 'Video Erstellen',

    // What is QWGenv section
    whatIsQWGenv: 'Was ist QWGenv?',
    qwgenvIntro: 'In der heutigen schnelllebigen digitalen Welt ist es für persönliche Erinnerungen, soziale Medien, Marketing-Kampagnen und professionelle Präsentationen essentiell geworden, schnell ansprechende Videoinhalte zu erstellen. QWGenv erfüllt diesen Bedarf durch eine unglaublich schnelle und effiziente Lösung.',
    qwgenvDescription: 'Unsere Plattform spezialisiert sich auf schnelle Videogenerierung und verwandelt Ihre statischen Fotos in dynamische, professionell aussehende Videos innerhalb von Sekunden. Ob Sie ein Content-Creator mit engen Fristen sind, ein Marketing-Spezialist, der schnelle Werbematerialien benötigt, oder jemand, der einfach seine Erinnerungen zum Leben erwecken möchte - Geschwindigkeit ist unsere oberste Priorität.',
    qwgenvDetails: 'Mit unserem vereinfachten Prozess kann das, was traditionell Stunden der Videobearbeitung dauert, jetzt in unter einer Minute erreicht werden. Laden Sie einfach Ihre Fotos hoch, wählen Sie Ihre Musik aus und beobachten Sie, wie unsere fortschrittliche Verarbeitungsmaschine Ihr Video fast sofort erstellt. Keine technischen Fähigkeiten erforderlich, keine langen Renderzeiten - nur schnelle, schöne Ergebnisse, die Sie sofort herunterladen und teilen können.',
    readyToStart: 'Bereit, Ihr erstes Video zu erstellen?',
    tryItNow: 'Jetzt ausprobieren',
    andSeeTheMagic: 'und die Magie erleben!',

    // Language dialog
    chooseLanguage: 'Wählen Sie Ihre Sprache',
    selectPreferredLanguage: 'Wählen Sie Ihre bevorzugte Sprache',
    searchLanguage: 'Nach einer Sprache suchen...',
    close: 'Schließen',

    // Upload Photos
    uploadPhotos: 'Fotos Hochladen',
    uploadVideos: 'Videos Hochladen',
    photos: 'Fotos',
    videos: 'Videos',
    clickToUpload: 'Klicken Sie zum Hochladen von Fotos oder ziehen Sie sie hierher',
    clickToUploadVideos: 'Klicken Sie zum Hochladen von Videos oder ziehen Sie sie hierher',
    photoFormats: 'PNG, JPG, GIF bis zu 10MB',
    videoFormats: 'MP4, MOV, WebM bis zu 10MB',
    uploadingPhotos: 'Fotos werden hochgeladen...',
    mediaGallery: 'Mediengalerie',
    photoUploaded: 'Foto hochgeladen',
    photosUploaded: 'Fotos hochgeladen',
    videoUploaded: 'Video hochgeladen',
    videosUploaded: 'Videos hochgeladen',
    clearAll: 'Alle Löschen',
    removePhoto: 'Foto entfernen',

    // Music Selector
    musicLibrary: 'Musikbibliothek',
    uploadMusic: 'Musik Hochladen',
    uploadYourMusic: 'Laden Sie Ihre Eigene Musik Hoch',
    uploadDifferentMusic: 'Andere Musik Hochladen',
    audioFormats: 'Unterstützt MP3, WAV, OGG, M4A und AAC • Max 10MB',
    uploadingTrack: 'Ihr Track wird hochgeladen...',
    musicSelected: 'Musik für Video ausgewählt - Klicken zum Abwählen',
    selectMusic: 'Diese Musik für Video auswählen',
    scanToAccess: 'Scannen Sie mit Ihrem Telefon, um auf das Video zuzugreifen',
    remove: 'Entfernen',

    // Video Export
    generateVideo: 'Video Generieren',
    generatingVideo: 'Video wird generiert...',
    videoGenerated: 'Video Erfolgreich Generiert!',
    slideshowReady: 'Slideshow Bereit',
    videoPreview: 'Video-Vorschau',
    downloadVideo: 'Video Herunterladen',
    createNewVideo: 'Neues Video Erstellen',

    // Home page content
    guideStepsTitle: 'Anleitung Schritte mit Fotos',
    guideStepsDescription: 'Erstaunliche Videos mit QWGenv zu erstellen ist so einfach wie drei einfache Schritte. Folgen Sie unserem optimierten Prozess, um Ihre Fotos in wenigen Minuten in fesselnde Videos zu verwandeln.',
    stepUploadMedia: 'Medien Hochladen',
    stepSelectMusic: 'Musik Auswählen',
    stepGenerateVideo: 'Video Generieren',
    stepUploadDescription: 'Ziehen Sie Ihre Fotos oder Videos hierher',
    stepMusicDescription: 'Wählen Sie aus unserer Bibliothek oder laden Sie Ihre eigene hoch',
    stepVideoDescription: 'Klicken Sie auf Generieren und laden Sie Ihr Video herunter',

    // Comments section
    userComments: 'Benutzerkommentare',
    submitComment: 'Kommentar Abschicken',
    shareExperience: 'Teilen Sie Ihre Erfahrung mit QWGenv...',
    yourName: 'Ihr Name',

    // Sample comments
    sampleComment1: 'Fantastisches Tool! Habe in wenigen Minuten ein schönes Video erstellt.',
    sampleComment2: 'Super einfach zu verwenden, liebe die Musikauswahl.',
    sampleComment3: 'Perfekt für die Erstellung von Inhalten für meine sozialen Medien!',
    timeAgo2Hours: 'vor 2 Stunden',
    timeAgo5Hours: 'vor 5 Stunden',
    timeAgo1Day: 'vor 1 Tag',
    justNow: 'Gerade eben',

    // Footer
    aboutUs: 'Über Uns',
    contactUs: 'Kontakt',
    privacyPolicy: 'Datenschutzrichtlinie',
    termsOfService: 'Nutzungsbedingungen',
    allRightsReserved: 'Alle Rechte vorbehalten',

    // Status messages
    pleaseFillRequirements: 'Bitte laden Sie Fotos hoch und wählen Sie Musik aus, bevor Sie ein Video generieren.',
    yourVideoIsReady: 'Ihr Video ist bereit für Vorschau und Download.',
    videoGeneratedSuccessfully: 'Video Erfolgreich Generiert!',
    videoPreviewTitle: 'Video-Vorschau',
    startingVideoGeneration: 'Video-Generierung wird gestartet...',
    creatingVideoClips: 'Video-Clips werden erstellt...',
    processingYourPhoto: 'Ihr Foto wird verarbeitet...',
    combiningWithMusic: 'Wird mit Musik kombiniert...',
    finishingTouches: 'Letzte Verbesserungen...',
    yourPhotoWillBeDisplayed: 'Ihr Foto wird angezeigt für',
    yourPhotosWillBeDisplayed: 'Ihre Fotos werden sequenziell angezeigt',
    secondsWithMusic: 'Sekunden mit Ihrer Musik.',
    unableToLoadVideo: 'Video-Vorschau kann nicht geladen werden. Die Datei wird möglicherweise noch verarbeitet.',
    scanWithPhone: 'Scannen Sie mit Ihrem Telefon, um auf das Video zuzugreifen',
    videoWillBeGenerated: 'Das Video wird im MP4-Format (H.264/AAC) generiert',
    processingMayTake: 'Die Verarbeitung kann je nach Anzahl der Fotos einige Minuten dauern',
    ready: 'Bereit',
    photo: 'Foto',
    photosSelected: 'Fotos + Musik ausgewählt',
    mobileQRCode: 'Mobiler QR-Code',
    qrCodeForVideo: 'QR-Code für Video',
    loadingMusicLibrary: 'Musikbibliothek wird geladen...',
    noLocalMusicFound: 'Keine Lokale Musik Gefunden',
    addMusicFiles: 'Fügen Sie Musikdateien zum lokalen Musikverzeichnis hinzu',

    // Additional UI text
    music: 'Musik',
    duration: 'Dauer',
    resolution: 'Auflösung',
    expires: 'Läuft ab',
    yourBrowserDoesNotSupport: 'Ihr Browser unterstützt das Video-Tag nicht',
    chooseFile: 'Datei auswählen',
    noFileChosen: 'Keine Datei ausgewählt',

    // Advertisement
    advertisementSpace: 'Werbefläche',
    adSenseLeaderboard: 'Google AdSense - Banner 728x90'
  },

  zh: {
    // Header
    home: '首页',
    generator: '生成器',
    languageSelector: '语言',

    // Home page
    welcome: '欢迎使用 TKVGen',
    subtitle: '将您的照片转换为带有自定义音乐的精美视频',
    getStarted: '开始使用',
    createVideo: '创建视频',

    // What is QWGenv section
    whatIsQWGenv: '什么是 QWGenv？',
    qwgenvIntro: '在当今快节奏的数字世界中，快速创建引人入胜的视频内容已成为个人回忆、社交媒体、营销活动和专业演示的必需品。QWGenv通过提供极其快速高效的解决方案来满足这一需求。',
    qwgenvDescription: '我们的平台专注于快速视频生成，在几秒钟内将您的静态照片转换为动态的专业质量视频。无论您是赶时间的内容创作者、需要快速推广材料的营销人员，还是只想让回忆变得生动的人，速度都是我们的首要任务。',
    qwgenvDetails: '通过我们简化的流程，传统上需要数小时视频编辑的工作现在可以在一分钟内完成。只需上传您的照片，选择您的音乐，然后观看我们的先进处理引擎几乎瞬间创建您的视频。无需技术技能，无需漫长的渲染时间 - 只需快速、美丽的结果，您可以立即下载和分享。',
    readyToStart: '准备创建您的第一个视频吗？',
    tryItNow: '立即尝试',
    andSeeTheMagic: '见证奇迹的发生！',

    // Language dialog
    chooseLanguage: '选择您的语言',
    selectPreferredLanguage: '选择您偏好的语言',
    searchLanguage: '搜索语言...',
    close: '关闭',

    // Upload Photos
    uploadPhotos: '上传照片',
    photos: '照片',
    videos: '视频',
    clickToUpload: '点击上传照片或拖拽到此处',
    mediaGallery: '媒体画廊',
    clearAll: '清除全部',

    // Music Selector
    musicLibrary: '音乐库',
    uploadMusic: '上传音乐',
    uploadYourMusic: '上传您的音乐',
    remove: '移除',

    // Video Export
    generateVideo: '生成视频',
    generatingVideo: '正在生成视频...',
    downloadVideo: '下载视频',
    createNewVideo: '创建新视频',

    // Status messages
    pleaseFillRequirements: '请上传照片并选择音乐后再生成视频。',
    ready: '准备就绪',
    photo: '照片'
  },

  ja: {
    // Header
    home: 'ホーム',
    generator: 'ジェネレーター',
    languageSelector: '言語',

    // Home page
    welcome: 'QWGenvへようこそ',
    subtitle: 'カスタム音楽で写真を素晴らしい動画に変換',
    getStarted: '始める',
    createVideo: '動画を作成',

    // Language dialog
    chooseLanguage: '言語を選択してください',
    selectPreferredLanguage: 'お好みの言語を選択してください',
    searchLanguage: '言語を検索...',
    close: '閉じる',

    // Upload Photos
    uploadPhotos: '写真をアップロード',
    uploadVideos: 'ビデオをアップロード',
    photos: '写真',
    videos: 'ビデオ',
    clickToUpload: '写真をアップロードするにはクリックするか、ここにドラッグしてください',
    clickToUploadVideos: 'ビデオをアップロードするにはクリックするか、ここにドラッグしてください',
    photoFormats: 'PNG、JPG、GIF（最大10MB）',
    videoFormats: 'MP4、MOV、WebM（最大10MB）',
    uploadingPhotos: '写真をアップロード中...',
    mediaGallery: 'メディアギャラリー',
    photoUploaded: '写真がアップロードされました',
    photosUploaded: '写真がアップロードされました',
    videoUploaded: 'ビデオがアップロードされました',
    videosUploaded: 'ビデオがアップロードされました',
    clearAll: 'すべてクリア',
    removePhoto: '写真を削除',

    // Music Selector
    musicLibrary: '音楽ライブラリ',
    uploadMusic: '音楽をアップロード',
    uploadYourMusic: '自分の音楽をアップロード',
    uploadDifferentMusic: '別の音楽をアップロード',
    audioFormats: 'MP3、WAV、OGG、M4A、AAC対応 • 最大10MB',
    uploadingTrack: 'トラックをアップロード中...',
    musicSelected: 'ビデオ用の音楽が選択されました - クリックして選択解除',
    selectMusic: 'ビデオ用にこの音楽を選択',
    scanToAccess: '携帯電話でスキャンしてビデオにアクセス',
    remove: '削除',
    loadingMusicLibrary: '音楽ライブラリを読み込み中...',
    noLocalMusicFound: 'ローカル音楽が見つかりません',
    addMusicFiles: '音楽ファイルを追加してください',

    // Video Export
    generateVideo: 'ビデオを生成',
    generatingVideo: 'ビデオを生成中...',
    videoGenerated: 'ビデオが正常に生成されました！',
    slideshowReady: 'スライドショーの準備完了',
    videoPreview: 'ビデオプレビュー',
    downloadVideo: 'ビデオをダウンロード',
    createNewVideo: '新しいビデオを作成',

    // Status messages
    nothingToGenerate: '生成するものがありません。',
    pleaseFillRequirements: 'ビデオを生成する前に写真をアップロードし、音楽を選択してください。',
    ready: '準備完了',
    photo: '写真',

    // Home page content
    guideStepsTitle: '写真で見るガイドステップ',
    guideStepsDescription: 'QWGenvで素晴らしいビデオを作成するのは、3つの簡単なステップと同じくらい簡単です。私たちの合理化されたプロセスに従って、数分で写真を魅力的なビデオに変換してください。',
    stepUploadMedia: 'メディアをアップロード',
    stepSelectMusic: '音楽を選択',
    stepGenerateVideo: 'ビデオを生成',
    stepUploadDescription: '写真やビデオをドラッグ＆ドロップ',
    stepMusicDescription: 'ライブラリから選択するか、自分のものをアップロード',
    stepVideoDescription: '生成をクリックしてビデオをダウンロード',

    // Comments section
    userComments: 'ユーザーコメント',
    submitComment: 'コメントを送信',
    shareExperience: 'QWGenvでの体験をシェアしてください...',
    yourName: 'お名前',

    // Sample comments
    sampleComment1: '素晴らしいツールです！数分で美しいビデオを作成できました。',
    sampleComment2: '使いやすく、音楽の選択が気に入っています。',
    sampleComment3: 'ソーシャルメディアのコンテンツ作成に最適です！',
    timeAgo2Hours: '2時間前',
    timeAgo5Hours: '5時間前',
    timeAgo1Day: '1日前',
    justNow: 'たった今',

    // Footer
    aboutUs: '私たちについて',
    contactUs: 'お問い合わせ',
    privacyPolicy: 'プライバシーポリシー',
    termsOfService: '利用規約',
    allRightsReserved: '全著作権所有',

    // Modal content
    aboutContent: 'QWGenvは、プロ品質のビデオ作成を誰でもアクセスできるように設計された最先端のビデオ作成プラットフォームです。革新的な技術とユーザーフレンドリーなデザインを通じてビデオ作成を民主化することが私たちの使命です。',
    getInTouch: 'チームにお問い合わせください：',
    email: 'メール',
    phone: '電話',
    address: '住所',
    yourEmail: 'メールアドレス',
    yourMessage: 'メッセージ',
    sendMessage: 'メッセージを送信',
    privacyContent: '私たちはあなたのプライバシーを尊重し、個人データの保護に取り組んでいます。このプライバシーポリシーは、QWGenvを使用する際に情報をどのように収集、使用、保護するかを説明しています。サービス提供に必要なデータのみを収集し、同意なしに第三者と個人情報を共有することはありません。',
    termsContent: 'QWGenvを使用することで、これらの利用規約に同意したことになります。個人的および商用ビデオ作成にプラットフォームを使用できます。アップロードしたコンテンツの所有権は保持されます。コミュニティガイドラインに違反したり、有害な活動に従事したアカウントを終了する権利を留保します。',

    // Additional UI text
    music: '音楽',
    duration: '時間',
    resolution: '解像度',
    expires: '有効期限',
    yourBrowserDoesNotSupport: 'お使いのブラウザはビデオタグをサポートしていません',
    chooseFile: 'ファイルを選択',
    noFileChosen: 'ファイルが選択されていません',
    mobileQRCode: 'モバイルQRコード',
    qrCodeForVideo: 'ビデオ用QRコード',
    yourVideoIsReady: 'ビデオの準備ができました！',
    yourPhotoWillBeDisplayed: '写真は次の時間表示されます',
    yourPhotosWillBeDisplayed: '写真は順番に表示されます',
    secondsWithMusic: '秒（音楽付き）',
    secondsEach: '秒ずつ',
    withMusic: '音楽付き',

    // Advertisement
    advertisementSpace: '広告スペース',
    adSenseLeaderboard: 'Google AdSense - バナー 728x90'
  },

  ko: {
    // Header
    home: '홈',
    generator: '생성기',
    languageSelector: '언어',

    // Home page
    welcome: 'QWGenv에 오신 것을 환영합니다',
    subtitle: '사용자 정의 음악으로 사진을 멋진 동영상으로 변환하세요',
    getStarted: '시작하기',
    createVideo: '동영상 만들기',

    // Language dialog
    chooseLanguage: '언어를 선택해주세요',
    selectPreferredLanguage: '선호하는 언어를 선택하세요',
    searchLanguage: '언어 검색...',
    close: '닫기',

    // Upload Photos
    uploadPhotos: '사진 업로드',
    uploadVideos: '동영상 업로드',
    photos: '사진',
    videos: '동영상',
    clickToUpload: '사진을 업로드하려면 클릭하거나 여기로 드래그하세요',
    clickToUploadVideos: '동영상을 업로드하려면 클릭하거나 여기로 드래그하세요',
    photoFormats: 'PNG, JPG, GIF (최대 10MB)',
    videoFormats: 'MP4, MOV, WebM (최대 10MB)',
    uploadingPhotos: '사진 업로드 중...',
    mediaGallery: '미디어 갤러리',
    photoUploaded: '사진이 업로드되었습니다',
    photosUploaded: '사진들이 업로드되었습니다',
    videoUploaded: '동영상이 업로드되었습니다',
    videosUploaded: '동영상들이 업로드되었습니다',
    clearAll: '모두 지우기',
    removePhoto: '사진 제거',

    // Music Selector
    musicLibrary: '음악 라이브러리',
    uploadMusic: '음악 업로드',
    uploadYourMusic: '자신의 음악 업로드',
    uploadDifferentMusic: '다른 음악 업로드',
    audioFormats: 'MP3, WAV, OGG, M4A, AAC 지원 • 최대 10MB',
    uploadingTrack: '트랙 업로드 중...',
    musicSelected: '동영상용 음악이 선택되었습니다 - 클릭하여 선택 해제',
    selectMusic: '동영상용으로 이 음악 선택',
    scanToAccess: '휴대폰으로 스캔하여 동영상에 액세스',
    remove: '제거',
    loadingMusicLibrary: '음악 라이브러리 로딩 중...',
    noLocalMusicFound: '로컬 음악을 찾을 수 없습니다',
    addMusicFiles: '음악 파일을 추가해주세요',

    // Video Export
    generateVideo: '동영상 생성',
    generatingVideo: '동영상 생성 중...',
    videoGenerated: '동영상이 성공적으로 생성되었습니다!',
    slideshowReady: '슬라이드쇼 준비 완료',
    videoPreview: '동영상 미리보기',
    downloadVideo: '동영상 다운로드',
    createNewVideo: '새 동영상 만들기',

    // Status messages
    nothingToGenerate: '생성할 것이 없습니다.',
    pleaseFillRequirements: '동영상을 생성하기 전에 사진을 업로드하고 음악을 선택해주세요.',
    ready: '준비됨',
    photo: '사진',

    // Home page content
    guideStepsTitle: '사진으로 보는 가이드 단계',
    guideStepsDescription: 'QWGenv로 놀라운 동영상을 만드는 것은 세 가지 간단한 단계만큼 쉽습니다. 몇 분 안에 사진을 매력적인 동영상으로 변환하는 우리의 간소화된 프로세스를 따라하세요.',
    stepUploadMedia: '미디어 업로드',
    stepSelectMusic: '음악 선택',
    stepGenerateVideo: '동영상 생성',
    stepUploadDescription: '사진이나 동영상을 드래그 앤 드롭',
    stepMusicDescription: '라이브러리에서 선택하거나 자신의 것을 업로드',
    stepVideoDescription: '생성을 클릭하고 동영상을 다운로드',

    // Comments section
    userComments: '사용자 댓글',
    submitComment: '댓글 제출',
    shareExperience: 'QWGenv 경험을 공유해주세요...',
    yourName: '이름',

    // Sample comments
    sampleComment1: '놀라운 도구입니다! 몇 분 만에 아름다운 동영상을 만들었습니다.',
    sampleComment2: '사용하기 매우 쉽고, 음악 선택이 마음에 듭니다.',
    sampleComment3: '소셜 미디어 콘텐츠 제작에 완벽합니다!',
    timeAgo2Hours: '2시간 전',
    timeAgo5Hours: '5시간 전',
    timeAgo1Day: '1일 전',
    justNow: '방금 전',

    // Footer
    aboutUs: '회사 소개',
    contactUs: '문의하기',
    privacyPolicy: '개인정보처리방침',
    termsOfService: '서비스 약관',
    allRightsReserved: '모든 권리 보유',

    // Modal content
    aboutContent: 'QWGenv는 전문적인 품질의 동영상 제작을 모든 사람이 접근할 수 있도록 설계된 최첨단 동영상 제작 플랫폼입니다. 혁신적인 기술과 사용자 친화적인 디자인을 통해 동영상 제작을 민주화하는 것이 우리의 사명입니다.',
    getInTouch: '팀에 문의하세요:',
    email: '이메일',
    phone: '전화',
    address: '주소',
    yourEmail: '이메일 주소',
    yourMessage: '메시지',
    sendMessage: '메시지 보내기',
    privacyContent: '우리는 귀하의 개인정보를 존중하며 개인 데이터 보호에 최선을 다하고 있습니다. 이 개인정보처리방침은 QWGenv를 사용할 때 정보를 수집, 사용 및 보호하는 방법을 설명합니다. 서비스 제공에 필요한 데이터만 수집하며 동의 없이 제3자와 개인정보를 공유하지 않습니다.',
    termsContent: 'QWGenv를 사용함으로써 이 서비스 약관에 동의하는 것입니다. 개인적 및 상업적 동영상 제작을 위해 플랫폼을 사용할 수 있습니다. 업로드된 콘텐츠의 소유권은 유지됩니다. 커뮤니티 가이드라인을 위반하거나 유해한 활동에 참여하는 계정을 종료할 권리를 보유합니다.',

    // Additional UI text
    music: '음악',
    duration: '길이',
    resolution: '해상도',
    expires: '만료',
    yourBrowserDoesNotSupport: '브라우저가 비디오 태그를 지원하지 않습니다',
    chooseFile: '파일 선택',
    noFileChosen: '선택된 파일 없음',
    mobileQRCode: '모바일 QR 코드',
    qrCodeForVideo: '비디오용 QR 코드',
    yourVideoIsReady: '비디오가 준비되었습니다!',
    yourPhotoWillBeDisplayed: '사진이 다음 시간 동안 표시됩니다',
    yourPhotosWillBeDisplayed: '사진들이 순차적으로 표시됩니다',
    secondsWithMusic: '초 (음악 포함)',
    secondsEach: '초씩',
    withMusic: '음악 포함',

    // Advertisement
    advertisementSpace: '광고 공간',
    adSenseLeaderboard: 'Google AdSense - 배너 728x90'
  },

  ar: {
    // Header
    home: 'الرئيسية',
    generator: 'المولد',
    languageSelector: 'اللغة',

    // Home page
    welcome: 'مرحباً بك في QWGenv',
    subtitle: 'حوّل صورك إلى مقاطع فيديو مذهلة مع موسيقى مخصصة',
    getStarted: 'ابدأ الآن',
    createVideo: 'إنشاء فيديو',

    // Language dialog
    chooseLanguage: 'اختر لغتك',
    selectPreferredLanguage: 'اختر اللغة المفضلة لديك',
    searchLanguage: 'البحث عن لغة...',
    close: 'إغلاق',

    // Upload Photos
    uploadPhotos: 'رفع الصور',
    uploadVideos: 'رفع الفيديوهات',
    photos: 'الصور',
    videos: 'الفيديوهات',
    clickToUpload: 'انقر لرفع الصور أو اسحبها هنا',
    clickToUploadVideos: 'انقر لرفع الفيديوهات أو اسحبها هنا',
    photoFormats: 'PNG، JPG، GIF (حتى 10 ميجابايت)',
    videoFormats: 'MP4، MOV، WebM (حتى 10 ميجابايت)',
    uploadingPhotos: 'جاري رفع الصور...',
    mediaGallery: 'معرض الوسائط',
    photoUploaded: 'تم رفع الصورة',
    photosUploaded: 'تم رفع الصور',
    videoUploaded: 'تم رفع الفيديو',
    videosUploaded: 'تم رفع الفيديوهات',
    clearAll: 'مسح الكل',
    removePhoto: 'إزالة الصورة',

    // Music Selector
    musicLibrary: 'مكتبة الموسيقى',
    uploadMusic: 'رفع الموسيقى',
    uploadYourMusic: 'رفع موسيقاك الخاصة',
    uploadDifferentMusic: 'رفع موسيقى أخرى',
    audioFormats: 'يدعم MP3، WAV، OGG، M4A، AAC • حتى 10 ميجابايت',
    uploadingTrack: 'جاري رفع المقطع...',
    musicSelected: 'تم اختيار الموسيقى للفيديو - انقر لإلغاء التحديد',
    selectMusic: 'اختر هذه الموسيقى للفيديو',
    scanToAccess: 'امسح بهاتفك للوصول إلى الفيديو',
    remove: 'إزالة',
    loadingMusicLibrary: 'جاري تحميل مكتبة الموسيقى...',
    noLocalMusicFound: 'لم يتم العثور على موسيقى محلية',
    addMusicFiles: 'يرجى إضافة ملفات موسيقية',

    // Video Export
    generateVideo: 'إنشاء فيديو',
    generatingVideo: 'جاري إنشاء الفيديو...',
    videoGenerated: 'تم إنشاء الفيديو بنجاح!',
    slideshowReady: 'العرض التقديمي جاهز',
    videoPreview: 'معاينة الفيديو',
    downloadVideo: 'تحميل الفيديو',
    createNewVideo: 'إنشاء فيديو جديد',

    // Status messages
    nothingToGenerate: 'لا يوجد شيء للإنشاء.',
    pleaseFillRequirements: 'يرجى رفع الصور واختيار الموسيقى قبل إنشاء الفيديو.',
    ready: 'جاهز',
    photo: 'صورة',

    // Home page content
    guideStepsTitle: 'خطوات الدليل بالصور',
    guideStepsDescription: 'إنشاء مقاطع فيديو مذهلة مع QWGenv سهل مثل ثلاث خطوات بسيطة. اتبع عمليتنا المبسطة لتحويل صورك إلى مقاطع فيديو جذابة في دقائق.',
    stepUploadMedia: 'رفع الوسائط',
    stepSelectMusic: 'اختيار الموسيقى',
    stepGenerateVideo: 'إنشاء الفيديو',
    stepUploadDescription: 'اسحب وأفلت صورك أو فيديوهاتك',
    stepMusicDescription: 'اختر من مكتبتنا أو ارفع موسيقاك',
    stepVideoDescription: 'انقر على إنشاء وحمل فيديوك',

    // Comments section
    userComments: 'تعليقات المستخدمين',
    submitComment: 'إرسال التعليق',
    shareExperience: 'شارك تجربتك مع QWGenv...',
    yourName: 'اسمك',

    // Sample comments
    sampleComment1: 'أداة رائعة! أنشأت فيديو جميل في دقائق.',
    sampleComment2: 'سهل الاستخدام جداً، أحب اختيار الموسيقى.',
    sampleComment3: 'مثالي لإنشاء محتوى وسائل التواصل الاجتماعي!',
    timeAgo2Hours: 'قبل ساعتين',
    timeAgo5Hours: 'قبل 5 ساعات',
    timeAgo1Day: 'قبل يوم',
    justNow: 'الآن',

    // Footer
    aboutUs: 'من نحن',
    contactUs: 'اتصل بنا',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    allRightsReserved: 'جميع الحقوق محفوظة',

    // Modal content
    aboutContent: 'QWGenv هي منصة إنشاء فيديو متطورة مصممة لجعل إنشاء مقاطع الفيديو عالية الجودة متاحة للجميع. مهمتنا هي إضفاء الطابع الديمقراطي على إنشاء الفيديو من خلال التكنولوجيا المبتكرة والتصميم سهل الاستخدام.',
    getInTouch: 'تواصل مع فريقنا:',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    yourEmail: 'بريدك الإلكتروني',
    yourMessage: 'رسالتك',
    sendMessage: 'إرسال الرسالة',
    privacyContent: 'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. تشرح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام QWGenv. نجمع فقط البيانات اللازمة لتقديم خدماتنا ولا نشارك معلوماتك الشخصية مع أطراف ثالثة دون موافقتك.',
    termsContent: 'باستخدام QWGenv، فإنك توافق على شروط الخدمة هذه. يمكنك استخدام منصتنا لإنشاء مقاطع فيديو شخصية وتجارية. تحتفظ بملكية المحتوى الذي ترفعه. نحتفظ بالحق في إنهاء الحسابات التي تنتهك إرشادات مجتمعنا أو تشارك في أنشطة ضارة.',

    // Additional UI text
    music: 'الموسيقى',
    duration: 'المدة',
    resolution: 'الدقة',
    expires: 'ينتهي',
    yourBrowserDoesNotSupport: 'متصفحك لا يدعم علامة الفيديو',
    chooseFile: 'اختر ملف',
    noFileChosen: 'لم يتم اختيار ملف',
    mobileQRCode: 'رمز QR للجوال',
    qrCodeForVideo: 'رمز QR للفيديو',
    yourVideoIsReady: 'الفيديو جاهز!',
    yourPhotoWillBeDisplayed: 'ستعرض صورتك لمدة',
    yourPhotosWillBeDisplayed: 'ستعرض صورك بالتتابع',
    secondsWithMusic: 'ثواني مع الموسيقى',
    secondsEach: 'ثواني لكل واحدة',
    withMusic: 'مع الموسيقى',

    // Advertisement
    advertisementSpace: 'مساحة إعلانية',
    adSenseLeaderboard: 'Google AdSense - بانر 728×90'
  },

  hi: {
    // Header
    home: 'होम',
    generator: 'जेनरेटर',
    languageSelector: 'भाषा',

    // Home page
    welcome: 'QWGenv में आपका स्वागत है',
    subtitle: 'कस्टम संगीत के साथ अपनी तस्वीरों को अद्भुत वीडियो में बदलें',
    getStarted: 'शुरू करें',
    createVideo: 'वीडियो बनाएं',

    // Language dialog
    chooseLanguage: 'अपनी भाषा चुनें',
    selectPreferredLanguage: 'अपनी पसंदीदा भाषा चुनें',
    searchLanguage: 'भाषा खोजें...',
    close: 'बंद करें',

    // Upload Photos
    uploadPhotos: 'फोटो अपलोड करें',
    uploadVideos: 'वीडियो अपलोड करें',
    photos: 'फोटो',
    videos: 'वीडियो',
    clickToUpload: 'फोटो अपलोड करने के लिए क्लिक करें या यहाँ ड्रैग करें',
    clickToUploadVideos: 'वीडियो अपलोड करने के लिए क्लिक करें या यहाँ ड्रैग करें',
    photoFormats: 'PNG, JPG, GIF (अधिकतम 10MB)',
    videoFormats: 'MP4, MOV, WebM (अधिकतम 10MB)',
    uploadingPhotos: 'फोटो अपलोड हो रही हैं...',
    mediaGallery: 'मीडिया गैलरी',
    photoUploaded: 'फोटो अपलोड हो गई',
    photosUploaded: 'फोटो अपलोड हो गईं',
    videoUploaded: 'वीडियो अपलोड हो गया',
    videosUploaded: 'वीडियो अपलोड हो गए',
    clearAll: 'सभी साफ़ करें',
    removePhoto: 'फोटो हटाएं',

    // Music Selector
    musicLibrary: 'संगीत लाइब्रेरी',
    uploadMusic: 'संगीत अपलोड करें',
    uploadYourMusic: 'अपना संगीत अपलोड करें',
    uploadDifferentMusic: 'अलग संगीत अपलोड करें',
    audioFormats: 'MP3, WAV, OGG, M4A, AAC समर्थित • अधिकतम 10MB',
    uploadingTrack: 'ट्रैक अपलोड हो रहा है...',
    musicSelected: 'वीडियो के लिए संगीत चुना गया - चुनावी रद्द करने के लिए क्लिक करें',
    selectMusic: 'वीडियो के लिए यह संगीत चुनें',
    scanToAccess: 'वीडियो एक्सेस करने के लिए अपने फोन से स्कैन करें',
    remove: 'हटाएं',
    loadingMusicLibrary: 'संगीत लाइब्रेरी लोड हो रही है...',
    noLocalMusicFound: 'कोई स्थानीय संगीत नहीं मिला',
    addMusicFiles: 'कृपया संगीत फाइलें जोड़ें',

    // Video Export
    generateVideo: 'वीडियो जेनरेट करें',
    generatingVideo: 'वीडियो जेनरेट हो रहा है...',
    videoGenerated: 'वीडियो सफलतापूर्वक जेनरेट हुआ!',
    slideshowReady: 'स्लाइडशो तैयार',
    videoPreview: 'वीडियो पूर्वावलोकन',
    downloadVideo: 'वीडियो डाउनलोड करें',
    createNewVideo: 'नया वीडियो बनाएं',

    // Status messages
    nothingToGenerate: 'जेनरेट करने के लिए कुछ नहीं है।',
    pleaseFillRequirements: 'कृपया वीडियो जेनरेट करने से पहले फोटो अपलोड करें और संगीत चुनें।',
    ready: 'तैयार',
    photo: 'फोटो',

    // Home page content
    guideStepsTitle: 'फोटो के साथ गाइड स्टेप्स',
    guideStepsDescription: 'QWGenv के साथ अद्भुत वीडियो बनाना तीन आसान चरणों जितना सरल है। मिनटों में अपनी तस्वीरों को आकर्षक वीडियो में बदलने के लिए हमारी सुव्यवस्थित प्रक्रिया का पालन करें।',
    stepUploadMedia: 'मीडिया अपलोड करें',
    stepSelectMusic: 'संगीत चुनें',
    stepGenerateVideo: 'वीडियो जेनरेट करें',
    stepUploadDescription: 'अपनी फोटो या वीडियो ड्रैग एंड ड्रॉप करें',
    stepMusicDescription: 'हमारी लाइब्रेरी से चुनें या अपना अपलोड करें',
    stepVideoDescription: 'जेनरेट पर क्लिक करें और अपना वीडियो डाउनलोड करें',

    // Comments section
    userComments: 'उपयोगकर्ता टिप्पणियाँ',
    submitComment: 'टिप्पणी सबमिट करें',
    shareExperience: 'QWGenv के साथ अपना अनुभव साझा करें...',
    yourName: 'आपका नाम',

    // Sample comments
    sampleComment1: 'अद्भुत टूल! मिनटों में एक सुंदर वीडियो बनाया।',
    sampleComment2: 'उपयोग करना बहुत आसान, संगीत चयन पसंद है।',
    sampleComment3: 'सोशल मीडिया कंटेंट निर्माण के लिए बिल्कुल सही!',
    timeAgo2Hours: '2 घंटे पहले',
    timeAgo5Hours: '5 घंटे पहले',
    timeAgo1Day: '1 दिन पहले',
    justNow: 'अभी',

    // Footer
    aboutUs: 'हमारे बारे में',
    contactUs: 'संपर्क करें',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    allRightsReserved: 'सभी अधिकार सुरक्षित',

    // Modal content
    aboutContent: 'QWGenv एक अत्याधुनिक वीडियो निर्माण प्लेटफॉर्म है जो पेशेवर-गुणवत्ता वीडियो निर्माण को सभी के लिए सुलभ बनाने के लिए डिज़ाइन किया गया है। नवाचार तकनीक और उपयोगकर्ता-अनुकूल डिज़ाइन के माध्यम से वीडियो निर्माण को लोकतांत्रिक बनाना हमारा मिशन है।',
    getInTouch: 'हमारी टीम से संपर्क करें:',
    email: 'ईमेल',
    phone: 'फोन',
    address: 'पता',
    yourEmail: 'आपका ईमेल',
    yourMessage: 'आपका संदेश',
    sendMessage: 'संदेश भेजें',
    privacyContent: 'हम आपकी गोपनीयता का सम्मान करते हैं और आपके व्यक्तिगत डेटा की सुरक्षा के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि QWGenv का उपयोग करते समय हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं। हम केवल अपनी सेवाएं प्रदान करने के लिए आवश्यक डेटा एकत्र करते हैं और आपकी सहमति के बिना तीसरे पक्ष के साथ आपकी व्यक्तिगत जानकारी साझा नहीं करते।',
    termsContent: 'QWGenv का उपयोग करके, आप इन सेवा की शर्तों से सहमत होते हैं। आप व्यक्तिगत और व्यावसायिक वीडियो निर्माण के लिए हमारे प्लेटफॉर्म का उपयोग कर सकते हैं। आप अपलोड की गई सामग्री का स्वामित्व बनाए रखते हैं। हम उन खातों को समाप्त करने का अधिकार सुरक्षित रखते हैं जो हमारे सामुदायिक दिशानिर्देशों का उल्लंघन करते हैं या हानिकारक गतिविधियों में संलग्न हैं।',

    // Additional UI text
    music: 'संगीत',
    duration: 'अवधि',
    resolution: 'रिज़ॉल्यूशन',
    expires: 'समाप्त होता है',
    yourBrowserDoesNotSupport: 'आपका ब्राउज़र वीडियो टैग का समर्थन नहीं करता',
    chooseFile: 'फाइल चुनें',
    noFileChosen: 'कोई फाइल नहीं चुनी गई',
    mobileQRCode: 'मोबाइल QR कोड',
    qrCodeForVideo: 'वीडियो के लिए QR कोड',
    yourVideoIsReady: 'आपका वीडियो तैयार है!',
    yourPhotoWillBeDisplayed: 'आपकी फोटो दिखाई जाएगी',
    yourPhotosWillBeDisplayed: 'आपकी फोटो क्रमानुसार दिखाई जाएंगी',
    secondsWithMusic: 'सेकंड संगीत के साथ',
    secondsEach: 'सेकंड प्रत्येक',
    withMusic: 'संगीत के साथ',

    // Advertisement
    advertisementSpace: 'विज्ञापन स्थान',
    adSenseLeaderboard: 'Google AdSense - बैनर 728x90'
  },

  ru: {
    // Header
    home: 'Главная',
    generator: 'Генератор',
    languageSelector: 'Язык',

    // Home page
    welcome: 'Добро пожаловать в QWGenv',
    subtitle: 'Превратите ваши фотографии в потрясающие видео с пользовательской музыкой',
    getStarted: 'Начать',
    createVideo: 'Создать видео',

    // Language dialog
    chooseLanguage: 'Выберите ваш язык',
    selectPreferredLanguage: 'Выберите предпочитаемый язык',
    searchLanguage: 'Поиск языка...',
    close: 'Закрыть',

    // Upload Photos
    uploadPhotos: 'Загрузить фото',
    uploadVideos: 'Загрузить видео',
    photos: 'Фото',
    videos: 'Видео',
    clickToUpload: 'Нажмите для загрузки фото или перетащите их сюда',
    clickToUploadVideos: 'Нажмите для загрузки видео или перетащите их сюда',
    photoFormats: 'PNG, JPG, GIF (до 10МБ)',
    videoFormats: 'MP4, MOV, WebM (до 10МБ)',
    uploadingPhotos: 'Загружаем фото...',
    mediaGallery: 'Медиа галерея',
    photoUploaded: 'Фото загружено',
    photosUploaded: 'Фото загружены',
    videoUploaded: 'Видео загружено',
    videosUploaded: 'Видео загружены',
    clearAll: 'Очистить все',
    removePhoto: 'Удалить фото',

    // Music Selector
    musicLibrary: 'Музыкальная библиотека',
    uploadMusic: 'Загрузить музыку',
    uploadYourMusic: 'Загрузить вашу музыку',
    uploadDifferentMusic: 'Загрузить другую музыку',
    audioFormats: 'Поддерживает MP3, WAV, OGG, M4A, AAC • Макс 10МБ',
    uploadingTrack: 'Загружаем трек...',
    musicSelected: 'Музыка выбрана для видео - нажмите для отмены выбора',
    selectMusic: 'Выбрать эту музыку для видео',
    scanToAccess: 'Сканируйте телефоном для доступа к видео',
    remove: 'Удалить',
    loadingMusicLibrary: 'Загружаем музыкальную библиотеку...',
    noLocalMusicFound: 'Локальная музыка не найдена',
    addMusicFiles: 'Пожалуйста, добавьте музыкальные файлы',

    // Video Export
    generateVideo: 'Создать видео',
    generatingVideo: 'Создаем видео...',
    videoGenerated: 'Видео успешно создано!',
    slideshowReady: 'Слайдшоу готово',
    videoPreview: 'Предпросмотр видео',
    downloadVideo: 'Скачать видео',
    createNewVideo: 'Создать новое видео',

    // Status messages
    nothingToGenerate: 'Нечего генерировать.',
    pleaseFillRequirements: 'Пожалуйста, загрузите фото и выберите музыку перед созданием видео.',
    ready: 'Готово',
    photo: 'Фото',

    // Home page content
    guideStepsTitle: 'Руководство с фотографиями',
    guideStepsDescription: 'Создание потрясающих видео с QWGenv так же просто, как три простых шага. Следуйте нашему упрощенному процессу, чтобы превратить ваши фотографии в захватывающие видео за минуты.',
    stepUploadMedia: 'Загрузить медиа',
    stepSelectMusic: 'Выбрать музыку',
    stepGenerateVideo: 'Создать видео',
    stepUploadDescription: 'Перетащите ваши фото или видео',
    stepMusicDescription: 'Выберите из нашей библиотеки или загрузите свою',
    stepVideoDescription: 'Нажмите создать и скачайте ваше видео',

    // Comments section
    userComments: 'Комментарии пользователей',
    submitComment: 'Отправить комментарий',
    shareExperience: 'Поделитесь вашим опытом с QWGenv...',
    yourName: 'Ваше имя',

    // Sample comments
    sampleComment1: 'Потрясающий инструмент! Создал красивое видео за минуты.',
    sampleComment2: 'Очень легко использовать, нравится выбор музыки.',
    sampleComment3: 'Идеально для создания контента в социальных сетях!',
    timeAgo2Hours: '2 часа назад',
    timeAgo5Hours: '5 часов назад',
    timeAgo1Day: '1 день назад',
    justNow: 'только что',

    // Footer
    aboutUs: 'О нас',
    contactUs: 'Связаться с нами',
    privacyPolicy: 'Политика конфиденциальности',
    termsOfService: 'Условия обслуживания',
    allRightsReserved: 'Все права защищены',

    // Modal content
    aboutContent: 'QWGenv - это передовая платформа для создания видео, разработанная для того, чтобы сделать профессиональное создание видео доступным для всех. Наша миссия - демократизировать создание видео через инновационные технологии и удобный дизайн.',
    getInTouch: 'Свяжитесь с нашей командой:',
    email: 'Электронная почта',
    phone: 'Телефон',
    address: 'Адрес',
    yourEmail: 'Ваша электронная почта',
    yourMessage: 'Ваше сообщение',
    sendMessage: 'Отправить сообщение',
    privacyContent: 'Мы уважаем вашу конфиденциальность и стремимся защитить ваши персональные данные. Эта политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу информацию при использовании QWGenv. Мы собираем только данные, необходимые для предоставления наших услуг, и никогда не передаем вашу личную информацию третьим лицам без вашего согласия.',
    termsContent: 'Используя QWGenv, вы соглашаетесь с этими условиями обслуживания. Вы можете использовать нашу платформу для создания личных и коммерческих видео. Вы сохраняете право собственности на загруженный контент. Мы оставляем за собой право прекратить работу учетных записей, которые нарушают наши рекомендации сообщества или участвуют во вредоносной деятельности.',

    // Additional UI text
    music: 'Музыка',
    duration: 'Длительность',
    resolution: 'Разрешение',
    expires: 'Истекает',
    yourBrowserDoesNotSupport: 'Ваш браузер не поддерживает видео тег',
    chooseFile: 'Выбрать файл',
    noFileChosen: 'Файл не выбран',
    mobileQRCode: 'Мобильный QR-код',
    qrCodeForVideo: 'QR-код для видео',
    yourVideoIsReady: 'Ваше видео готово!',
    yourPhotoWillBeDisplayed: 'Ваше фото будет отображаться',
    yourPhotosWillBeDisplayed: 'Ваши фото будут отображаться последовательно',
    secondsWithMusic: 'секунд с музыкой',
    secondsEach: 'секунд каждое',
    withMusic: 'с музыкой',

    // Advertisement
    advertisementSpace: 'Рекламное место',
    adSenseLeaderboard: 'Google AdSense - Баннер 728x90'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('tkvgen-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tkvgen-language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const getCurrentLanguageInfo = () => {
    return AVAILABLE_LANGUAGES.find(lang => lang.code === currentLanguage) || AVAILABLE_LANGUAGES[0];
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t, // translate function
    getCurrentLanguageInfo,
    availableLanguages: AVAILABLE_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext };