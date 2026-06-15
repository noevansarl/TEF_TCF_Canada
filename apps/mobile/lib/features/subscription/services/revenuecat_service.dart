import 'dart:io';
import 'package:purchases_flutter/purchases_flutter.dart';

class RevenueCatService {
  static const String _apiKeyAndroid = 'goog_placeholder_api_key';
  static const String _apiKeyiOS = 'appl_placeholder_api_key';

  static Future<void> initialize(String userId) async {
    await Purchases.setLogLevel(LogLevel.debug);
    
    PurchasesConfiguration config;
    if (Platform.isAndroid) {
      config = PurchasesConfiguration(_apiKeyAndroid);
    } else {
      config = PurchasesConfiguration(_apiKeyiOS);
    }
    config.appUserID = userId;
    
    await Purchases.configure(config);
  }

  static Future<CustomerInfo> getCustomerInfo() async {
    return await Purchases.getCustomerInfo();
  }

  static Future<List<Package>> getPackages() async {
    final offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  }

  static Future<CustomerInfo> purchase(Package package) async {
    final purchaseResult = await Purchases.purchasePackage(package);
    return purchaseResult.customerInfo;
  }

  static Future<CustomerInfo> restorePurchases() async {
    return await Purchases.restorePurchases();
  }

  static bool hasActiveSubscription(CustomerInfo info) {
    return info.entitlements.active.isNotEmpty;
  }

  static String? getActivePlan(CustomerInfo info) {
    if (info.entitlements.active.containsKey('premium')) return 'premium';
    if (info.entitlements.active.containsKey('avance')) return 'avance';
    if (info.entitlements.active.containsKey('essentiel')) return 'essentiel';
    return null;
  }
}
