package com.travelmarket.backend.tour.service;

import com.travelmarket.backend.tour.dto.request.AddTourMediaRequest;
import com.travelmarket.backend.tour.dto.response.TourMediaResponse;
import com.travelmarket.backend.tour.entity.TourMedia;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.mapper.TourMapper;
import com.travelmarket.backend.tour.repository.TourMediaRepository;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TourMediaService {

    private final TourMediaRepository mediaRepository;
    private final TourTemplateRepository templateRepository;
    private final TourMapper tourMapper;

    @Transactional
    public TourMediaResponse addMedia(Long templateId, Long guideId, AddTourMediaRequest request) {
        TourTemplate template = templateRepository.findByIdAndGuideId(templateId, guideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found or not owned by you"));

        TourMedia media = new TourMedia();
        media.setTemplate(template);
        media.setMediaType(request.getMediaType());
        media.setUrl(request.getUrl());
        media.setDisplayOrder(request.getDisplayOrder());

        TourMedia saved = mediaRepository.save(media);
        return tourMapper.toMediaResponse(saved);
    }

    @Transactional
    public void deleteMedia(Long mediaId, Long guideId) {
        TourMedia media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));

        if (!media.getTemplate().getGuide().getId().equals(guideId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own the tour this media belongs to");
        }

        mediaRepository.delete(media);
    }
}
