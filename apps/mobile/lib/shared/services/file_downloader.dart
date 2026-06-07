import 'dart:io';
import 'package:path_provider/path_provider.dart';

class FileDownloader {
  static final HttpClient _httpClient = HttpClient();

  /// Télécharge un fichier depuis une [url] et l'enregistre localement dans le répertoire Documents.
  /// Retourne le chemin absolu vers le fichier local ou `null` en cas d'erreur.
  static Future<String?> downloadFile(String url) async {
    try {
      final uri = Uri.parse(url);
      
      // Nettoyer l'URL pour extraire le nom du fichier sans les paramètres de requête (comme les tokens CDN)
      String filename = uri.pathSegments.isNotEmpty ? uri.pathSegments.last : 'audio_${DateTime.now().millisecondsSinceEpoch}.mp3';
      if (filename.contains('?')) {
        filename = filename.split('?').first;
      }

      // Obtenir le répertoire de stockage local de l'application
      final directory = await getApplicationDocumentsDirectory();
      final offlineFolder = Directory('${directory.path}/offline_audio');
      
      // S'assurer que le dossier existe
      if (!await offlineFolder.exists()) {
        await offlineFolder.create(recursive: true);
      }

      final localFilePath = '${offlineFolder.path}/$filename';
      final localFile = File(localFilePath);

      // Si le fichier existe déjà, pas besoin de le retélécharger
      if (await localFile.exists()) {
        return localFilePath;
      }

      // Télécharger en flux direct pour économiser la mémoire vive (RAM)
      final request = await _httpClient.getUrl(uri);
      final response = await request.close();

      if (response.statusCode == 200) {
        final fileSink = localFile.openWrite();
        await response.pipe(fileSink);
        await fileSink.close();
        return localFilePath;
      } else {
        return null;
      }
    } catch (e) {
      // Gérer l'erreur proprement et retourner null
      return null;
    }
  }
}
