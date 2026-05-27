import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  // Canal de notification pour Android (requis pour les bannières en 1er plan)
  static const AndroidNotificationChannel _androidChannel = AndroidNotificationChannel(
    'high_importance_channel', // id
    'High Importance Notifications', // title
    description: 'This channel is used for important notifications.', // description
    importance: Importance.max,
  );

  Future<void> initialize() async {
    // 1. Demander les permissions de notification
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted notification permissions.');
    } else {
      debugPrint('User declined or has not accepted notification permissions.');
    }

    // 2. Initialiser les notifications locales pour Android
    const AndroidInitializationSettings androidInitSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const InitializationSettings initSettings = InitializationSettings(
      android: androidInitSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        // Gérer le clic sur la notification
        final payload = response.payload;
        if (payload != null) {
          debugPrint('Notification clicked with payload: $payload');
          // Ici, on peut router l'utilisateur vers une page spécifique via GoRouter
        }
      },
    );

    // Créer le canal Android
    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidChannel);

    // 3. Écouter les messages en premier plan
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      RemoteNotification? notification = message.notification;
      AndroidNotification? android = message.notification?.android;

      if (notification != null && android != null && !kIsWeb) {
        _localNotifications.show(
          notification.hashCode,
          notification.title,
          notification.body,
          NotificationDetails(
            android: AndroidNotificationDetails(
              _androidChannel.id,
              _androidChannel.name,
              channelDescription: _androidChannel.description,
              icon: '@mipmap/ic_launcher',
            ),
          ),
          payload: message.data.toString(),
        );
      }
    });

    // 4. Écouter l'ouverture de l'application depuis une notification
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('App opened from notification: ${message.notification?.title}');
    });

    // 5. Récupérer et sauvegarder le token FCM
    await saveDeviceToken();
  }

  // Obtenir et enregistrer le token FCM de l'appareil
  Future<String?> saveDeviceToken() async {
    try {
      String? token = await _fcm.getToken();
      if (token != null) {
        debugPrint('FCM Token: $token');
        
        // Mettre à jour dans Supabase
        final supabase = Supabase.instance.client;
        final user = supabase.auth.currentUser;
        if (user != null) {
          await supabase.from('users').update({
            'metadata': {
              'fcm_token': token,
              'last_token_update': DateTime.now().toIso8601String(),
            }
          }).eq('id', user.id);
          debugPrint('FCM token synchronized with Supabase.');
        }
      }
      return token;
    } catch (e) {
      debugPrint('Failed to get FCM token: $e');
      return null;
    }
  }
}
